chrome.action.onClicked.addListener(async () => {
    const url = chrome.runtime.getURL('index.html');
    const tabs = await chrome.tabs.query({ url });

    if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true });
        chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
        chrome.tabs.create({ url: 'index.html' });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'capture_tab') {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
            sendResponse({ dataUrl });
        });
        return true; // Keep channel open for async response
    }
});
