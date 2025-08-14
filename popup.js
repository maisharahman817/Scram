document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleScram');
  const statusText = document.getElementById('status');

  // Load saved toggle state
  chrome.storage.local.get(['scramEnabled'], (result) => {
    toggle.checked = result.scramEnabled || false;
    updateStatus();
  });

  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.local.set({ scramEnabled: enabled });
    updateStatus();

    // Tell the content script to enable/disable scanning
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: enabled ? "startScram" : "stopScram" });
    });
  });

  function updateStatus() {
    statusText.textContent = toggle.checked ? "Scram! is ON" : "Scram! is OFF";
  }

  document.addEventListener('DOMContentLoaded', () => {
  console.log("Popup loaded");
  // rest of your code...
});

});
