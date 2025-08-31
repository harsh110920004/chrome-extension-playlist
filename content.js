function getPlaylistData() {
    // Try full playlist page first
    let videos = [...document.querySelectorAll("ytd-playlist-video-list-renderer ytd-playlist-video-renderer")];

    // If none found, fallback to sidebar playlist panel
    if (videos.length === 0) {
        videos = [...document.querySelectorAll("ytd-playlist-panel-video-renderer")];
    }

    console.log("Found videos:", videos.length);

    return videos.map(video => {
        const title = video.querySelector("#video-title")?.textContent.trim() || "";
        const duration = video.querySelector("span.ytd-thumbnail-overlay-time-status-renderer")?.textContent.trim() || "";

        // Watched detection
        let watched = false;

        // Case 1: "Watched" badge
        if (video.querySelector("ytd-thumbnail-overlay-playback-status-renderer")) {
            watched = true;
        }

        // Case 2: Progress bar full
        const progressBar = video.querySelector(".ytd-thumbnail-overlay-resume-playback-renderer");
        if (progressBar && progressBar.style.width === "100%") {
            watched = true;
        }

        return { title, duration, watched };
    });
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "getPlaylist") {
        console.log("Popup asked for playlist data");
        sendResponse({ playlist: getPlaylistData() });
    }
});

