chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes("indeed.com/jobs")) {
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_PREDICTION") {
    fetch("https://scram-j85q.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload)
    })
    .then(res => res.json())
    .then(data => sendResponse(data))
    .catch(() => sendResponse(null));
    return true;
  }
});