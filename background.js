chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("indeed.com/jobs?")) {
        const queryParameters = tab.url.split("?")[1];
        const params = new URLSearchParams(queryParameters);

        chrome.tabs.sendMessage(tabId,{
            type: "NEW",
            jobId: urlParameters.get("q"),
        });
    }
});