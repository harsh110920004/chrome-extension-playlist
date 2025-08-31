// background.js
console.log("Learning Tracker: Background script started");

// Listen for tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
    console.log("Learning Tracker: YouTube page detected, injecting script");
    
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(err => {
      console.log("Learning Tracker: Script injection failed:", err);
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Learning Tracker: Background received message:", message);
  
  if (message.type === 'VIDEO_PROGRESS' || message.type === 'VIDEO_COMPLETED') {
    const videoData = message.data;
    const storageKey = videoData.url;
    
    console.log("Learning Tracker: Processing video data for:", storageKey);
    
    chrome.storage.local.get([storageKey]).then((result) => {
      const existingData = result[storageKey] || {};
      
      const updatedData = {
        ...existingData,
        ...videoData,
        lastWatched: Date.now()
      };
      
      console.log("Learning Tracker: Saving data:", updatedData);
      
      return chrome.storage.local.set({
        [storageKey]: updatedData
      });
    }).then(() => {
      console.log("Learning Tracker: Data saved successfully");
    }).catch((error) => {
      console.error("Learning Tracker: Storage error:", error);
    });
  }
});
