// Gemini API Key (Replace with yours from Google AI Studio)
const API_KEY = "AIzaSyBUrg1zCYo_TY4t_hDHZNkWKJgAeOP50BI";

// Elements
const shareBtn = document.getElementById("share-btn");
const askBtn = document.getElementById("ask-btn");
const screenShareDiv = document.getElementById("screen-share");
const aiResponseDiv = document.getElementById("ai-response");

let stream;

// 1. Screen Sharing
shareBtn.addEventListener("click", async () => {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const video = document.createElement("video");
        video.srcObject = stream;
        video.autoplay = true;
        screenShareDiv.innerHTML = "";
        screenShareDiv.appendChild(video);
        askBtn.disabled = false;
    } catch (err) {
        aiResponseDiv.textContent = "Error: " + err.message;
    }
});

// 2. Capture Screenshot & Ask Gemini
askBtn.addEventListener("click", async () => {
    if (!stream) return;
    
    const video = screenShareDiv.querySelector("video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL("image/jpeg").split(",")[1];

    aiResponseDiv.textContent = "Analyzing with Gemini...";
    
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "The user is learning MIT App Inventor. Give step-by-step guidance based on this screenshot:" },
                            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
                        ]
                    }]
                })
            }
        );
        const data = await response.json();
        aiResponseDiv.textContent = data.candidates[0].content.parts[0].text;
    } catch (err) {
        aiResponseDiv.textContent = "API Error: " + err.message;
    }
});