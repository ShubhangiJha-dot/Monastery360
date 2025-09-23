
const openBtn = document.querySelector(".first-two button"); // First button in first-two
const overlay = document.getElementById("videoOverlay");
const closeBtn = document.getElementById("closeBtn");
const video = overlay.querySelector("video");

openBtn.addEventListener("click", () => {
    overlay.style.display = "flex";
    video.play(); // autoplay when opened
});

closeBtn.addEventListener("click", () => {
    overlay.style.display = "none";
    video.pause();
    video.currentTime = 0; // reset video
});

// Close if clicking outside the popup
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
        overlay.style.display = "none";
        video.pause();
        video.currentTime = 0;
    }
});

