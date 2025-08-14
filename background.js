// background.js

let scramEnabled = true; // Default ON

// Listen for toggle changes from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_SCRAM") {
    scramEnabled = message.enabled;
    console.log("Scram is now", scramEnabled ? "ON" : "OFF");
    sendResponse({ success: true });
  }

  // Handle prediction requests from content.js
  if (message.type === "FETCH_PREDICTION") {
    fetch("https://scram-production.up.railway.app/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload)
    })
      .then(res => res.json())
      .then(data => sendResponse(data))
      .catch(() => sendResponse(null));
    return true; // Keeps the message channel open for async response
  }
});

// Detect when a relevant Indeed job search page is loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!scramEnabled) return; // ✅ Do nothing if Scram is OFF

  if (changeInfo.status === "complete" && tab.url && tab.url.includes("indeed.com/jobs")) {
    const queryParameters = tab.url.split("?")[1];
    if (!queryParameters) return;

    const params = new URLSearchParams(queryParameters);
    console.log("Background script detected new job search:", params.get("q"));

    const jobQuery = params.get("q");
    const jobId = params.get("jk");

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      query: jobQuery,
      jobId: jobId,
      url: tab.url
    });
  }
});
