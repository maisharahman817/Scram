chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("indeed.com/jobs?")) {
        const queryParameters = tab.url.split("?")[1];
        const params = new URLSearchParams(queryParameters);

        chrome.tabs.sendMessage(tabId,{
            type: "NEW",
            jobId: params.get("q"),
        });
    }
});
