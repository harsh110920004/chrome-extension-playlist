console.log("Popup opened");

function formatDuration(str) {
    if (!str) return 0;
    let parts = str.split(":").map(Number);
    let sec = 0;
    while (parts.length) sec = sec * 60 + parts.shift();
    return sec;
}

function secondsToHMS(sec) {
    let h = Math.floor(sec / 3600);
    let m = Math.floor((sec % 3600) / 60);
    let s = sec % 60;
    return `${h}h ${m}m ${s}s`;
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("Injecting content.js...");

    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            files: ["content.js"]
        },
        () => {
            console.log("Sending message to content.js...");
            chrome.tabs.sendMessage(tabs[0].id, { action: "getPlaylist" }, (response) => {
                console.log("Got response:", response);
                if (!response) {
                    document.getElementById("stats").innerHTML = "<p>Open a YouTube playlist to track progress.</p>";
                    return;
                }

                let playlist = response.playlist;
                let total = playlist.length;
                let watched = playlist.filter(v => v.watched).length;

                let totalTime = 0, watchedTime = 0;
                playlist.forEach(v => {
                    let sec = formatDuration(v.duration);
                    totalTime += sec;
                    if (v.watched) watchedTime += sec;
                });

                let percentage = total > 0 ? Math.round((watched / total) * 100) : 0;

                let stats = `
                    <p><b>${watched}/${total} watched</b></p>
                    <p>${secondsToHMS(watchedTime)} watched / ${secondsToHMS(totalTime)} total</p>
                    <p>${percentage}% completed</p>
                `;
                document.getElementById("stats").innerHTML = stats;
                document.getElementById("progress-bar").style.width = `${percentage}%`;

                let list = document.getElementById("playlist");
                list.innerHTML = "";
                playlist.forEach(v => {
                    let li = document.createElement("li");
                    li.innerHTML = `${v.watched ? "✅" : "⏳"} ${v.title} (${v.duration})`;
                    list.appendChild(li);
                });
            });
        }
    );
});
