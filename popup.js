document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleScram');
  const statusText = document.getElementById('status');

  // Load saved toggle state from chrome.storage.local
  chrome.storage.local.get(['scramEnabled'], (result) => {
    const scramEnabled = result.scramEnabled;

    // Set the toggle state to the saved value or default to OFF (false)
    toggle.checked = scramEnabled === undefined ? false : scramEnabled;
    updateStatus();
  });

  // When the toggle state changes
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;

    // Save the new state of the toggle to chrome.storage.local
    chrome.storage.local.set({ scramEnabled: enabled });
    updateStatus();

    // Send a message to the content script to start or stop scanning
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: enabled ? "startScram" : "stopScram" });
      }
    });
  });

  // Function to update the status text based on the toggle state
  function updateStatus() {
    statusText.textContent = toggle.checked ? "Scram! is ON" : "Scram! is OFF";
  }

  console.log("Popup loaded");
});
