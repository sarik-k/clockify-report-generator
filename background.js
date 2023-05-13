// A function to use as callback
function handleReport(msg) {
    
}

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith("https://app.clockify.me/tracker")) {
        chrome.tabs.sendMessage(tab.id, { text: 'get_clockify_report', tabId: tab.id }, handleReport);
    }
});

