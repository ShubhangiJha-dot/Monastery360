const chatsContainer=document.querySelector(".chats-container");
const container=document.querySelector(".container");
const promptForm=document.querySelector(".prompt-form");
const promptInput=promptForm.querySelector(".prompt-input");
const fileInput=promptForm.querySelector("#file-input");
const fileUploadWrapper=promptForm.querySelector(".file-upload-wrapper");
const themeToggle=document.querySelector("#theme-toggle-btn");


const API_KEY="AIzaSyCKkr-rAwgKPYiLwmX2HfoXrJ4iNBKcKAw";
const API_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
 
let typingInterval,controller;
const userData={ message : "", file: {}};
const chatHistory=[];
//function to create ,message elements
const  createMsgElement=(content, className)=>{
    const div=document.createElement("div");
    div.classList.add("message", className);
    div.innerHTML=content;
    return div;
};

 
const scrollToBottom=()=> container.scrollTo({ top: container.scrollHeight, behavior : "smooth"});




const typingEffect=(text , textElement,botMsgDiv)=>{
    textElement.textContent="";
    const words = text.split("");
    let wordIndex=0;

 typingInterval= setInterval(()=>{
     if (wordIndex <words.length ){
        textElement.textContent+=(wordIndex === 0 ? "":"")+words[wordIndex++];  
        botMsgDiv.classList.remove("loading");  
        scrollToBottom();
     }else {
        clearInterval(typingInterval);
     } 
    },40);
}



const generateResponse= async (botMsgDiv,userMessage)=>{
    const textElement=botMsgDiv.querySelector(".message-text");
    controller=new AbortController();
    chatHistory.push({
     role: "user",
     parts:[{text:userMessage}, ...(userData.file.data ? [{inline_data: (({fileName , isImage,...rest})=> rest)(userData.file)}]:[])]
    });
    try{
        const response= await fetch(API_URL,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({contents: chatHistory}),
            signal: controller.signal

        });

        const data=await response.json();
        if(!response.ok) throw new Error (data.error.message);
         const responseText =data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g,"$1").trim();
         
         typingEffect(responseText,textElement,botMsgDiv);
          chatHistory.push({role: "model", parts:[{text:responseText}] });
          console.log(chatHistory);
}catch(error){
if (error.name === "AbortError") {
        console.warn("❌ Fetch aborted by user.");
        textElement.textContent = "⚠️ Response aborted.";
    } else {
        console.error("❌ Fetch failed:", error);
        textElement.textContent = "⚠️ Failed to fetch response.";
}
}finally{
    userData.file={};
}
 
}

//handle the form submission//
const  handleFormSubmit=(e) =>{
    e.preventDefault();
    document.getElementById('welcome-banner').classList.add('hide');
    const userMessage=promptInput.value.trim();
    if (!userMessage||  document.body.classList.contains("bot-responding")) return;

promptInput.value="";
userData.message = userMessage;
fileUploadWrapper.classList.remove("active","img-attached","file-attached");

    //generate user message html and add in the chats conatiner
    const userMsgHTML = `<p class="message-text"></p>
${userData.file.data ? 
  (userData.file.isImage 
    ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment"/>` 
    : `<p class="file-attachment"><span class="material-symbols-rounded">description</span> ${userData.file.fileName}</p>`
  ) 
: ""}`;

   const userMsgDiv=createMsgElement(userMsgHTML,"user-message") ; 
    
   userMsgDiv.querySelector(".message-text").textContent=userMessage;
   chatsContainer.appendChild(userMsgDiv);

setTimeout(()=>{
 const botMsgHTML=` <img src="gemini-chatbot-logo.svg" class="avatar loading"> <p class="message-text"> Just a sec..</p>`;  
 const botMsgDiv=createMsgElement(botMsgHTML,"bot-message") ; 
    
chatsContainer.appendChild(botMsgDiv);
scrollToBottom();
generateResponse(botMsgDiv,userMessage);
userData.file={};
fileUploadWrapper.classList.remove("active","img-attached","file-attached");
   },600);
}

fileInput.addEventListener("change",()=>{
    const file =fileInput.files[0];
    if(!file) return;
    const isImage =file.type.startsWith("image/")
    const reader=new FileReader();
    reader.readAsDataURL(file);

    reader.onload=(e)=>{
        fileInput.value = "";
        const base64String=e.target.result.split(",")[1];
        fileUploadWrapper.querySelector(".file-preview").src=e.target.result; 
        fileUploadWrapper.classList.add("active" , isImage ? "img-attached":"file-attached");

        userData.file={fileName: file.name, data: base64String,mime_type:file.type , isImage};
    }
})

document.querySelector("#cancel-file-btn").addEventListener("click",()=>{
    userData.file={};
    fileUploadWrapper.classList.remove("active","img-attached","file-attached");
    fileUploadWrapper.querySelector(".file-preview").src = "";
}); 

document.querySelector("#dlt-chats-btn").addEventListener("click",()=>{
   chatHistory.length=0;
   chatsContainer.innerHTML="";
   document.body.classList.remove("bot-responding");
}); 

document.querySelector("#stop-response-btn").addEventListener("click",()=>{
    userData.file={};
    controller?.abort();
    clearInterval(typingInterval);

  
}); 

themeToggle.addEventListener("click",()=>{
document.body.classList.toggle("light-theme");
});

promptForm.addEventListener("submit",handleFormSubmit);
document.querySelector("#add-file-btn").addEventListener("click",()=> fileInput.click());