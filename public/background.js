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
        return true;
    }

    if (message.action === 'fetch_html') {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        fetch(message.url, { signal: controller.signal })
            .then(res => {
                clearTimeout(timeout);
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                return res.text();
            })
            .then(html => sendResponse({ html }))
            .catch(err => sendResponse({ error: err.message || 'Fetch failed' }));

        return true;
    }
});
