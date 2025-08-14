console.log("Content script loaded");

let scanningEnabled = false;
let observer = null;
let mutationObserver = null;
const processedJobs = new Set();
let scamCount = 0;
let scamJobs = [];

const FLAG_CLASS = 'fake-job-flag';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startScram") {
    console.log("Scram! scanning started");
    if (!scanningEnabled) {
      scanningEnabled = true;
      startScanning();
    }
  } else if (message.action === "stopScram") {
    console.log("Scram! scanning stopped");
    scanningEnabled = false;
    stopScanning();
  }
});

function startScanning() {
  scamCount = 0;
  scamJobs = [];
  processedJobs.clear();

  // Create or update UI message
  showScanningMessage();

  // Setup IntersectionObserver
  if (observer) return; // Already running

  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        processJobCard(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -50% 0px'
  });

  // Observe existing job cards
  const jobCards = document.querySelectorAll('[data-testid="jobsearch-SerpJobCard"], .job_seen_beacon');
  jobCards.forEach(card => observer.observe(card));

  // Setup MutationObserver to watch for new cards added dynamically
  const container = document.querySelector('#mosaic-provider-jobcards') || document.body;
  mutationObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches('[data-testid="jobsearch-SerpJobCard"], .job_seen_beacon')) {
          observer.observe(node);
        } else {
          node.querySelectorAll('[data-testid="jobsearch-SerpJobCard"], .job_seen_beacon').forEach(card => {
            observer.observe(card);
          });
        }
      });
    });
  });
  mutationObserver.observe(container, { childList: true, subtree: true });
}

function stopScanning() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }

  hideScanningMessage();
  clearSummaryMessage();

  processedJobs.clear();
  scamCount = 0;
  scamJobs = [];
}

async function processJobCard(card) {
  if (!scanningEnabled) return; // Prevent scanning if stopped

  const jobText = card.innerText.trim();
  if (!jobText || processedJobs.has(jobText)) return;
  processedJobs.add(jobText);

  try {
    showScanningMessage();

    const response = await fetch('https://scram-production.up.railway.app/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_description: jobText.slice(0, 1000) })
    });

    if (!response.ok) throw new Error('API response not ok');

    const result = await response.json();

    if (result.prediction.toLowerCase().includes('fake')) {
      addFlag(card, result);
    }

    console.log('Prediction result:', result);

    showSuccessMessage();
  } catch (err) {
    console.error("Error fetching prediction:", err);
    hideScanningMessage();
  }
}

function addFlag(card, result) {
  if (card.querySelector(`.${FLAG_CLASS}`)) return; // Prevent duplicates

  const flag = document.createElement('div');
  flag.className = FLAG_CLASS;
  flag.style.cssText = `
    background: red;
    color: white;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 4px;
    display: inline-block;
    margin-top: 5px;
  `;
  flag.innerText = `⚠️ FAKE JOB (Conf: ${result.confidence})`;

  const insertAfter = card.querySelector('.jobTitle') || card.querySelector('h2');
  if (insertAfter) {
    insertAfter.parentElement.appendChild(flag);
  } else {
    card.appendChild(flag);
  }

  scamCount++;
  scamJobs.push(card.querySelector('.jobTitle')?.innerText || 'Unknown Job');
}

// UI helper functions (create/show/hide scanning & summary messages):

function createScanningMessage() {
  let msg = document.getElementById('scram-scanning-msg');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'scram-scanning-msg';
    msg.style.position = 'fixed';
    msg.style.bottom = '20px';
    msg.style.right = '20px';
    msg.style.backgroundColor = '#ff5555';
    msg.style.color = 'white';
    msg.style.padding = '10px 15px';
    msg.style.borderRadius = '8px';
    msg.style.fontSize = '14px';
    msg.style.fontWeight = 'bold';
    msg.style.zIndex = '999999';
    msg.style.display = 'flex';
    msg.style.alignItems = 'center';
    msg.style.gap = '10px';

    const spinner = document.createElement('div');
    spinner.id = 'scram-spinner';
    spinner.style.border = '3px solid white';
    spinner.style.borderTop = '3px solid rgba(255,255,255,0.3)';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '16px';
    spinner.style.height = '16px';
    spinner.style.animation = 'spin 1s linear infinite';

    const text = document.createElement('span');
    text.id = 'scram-msg-text';
    text.innerText = 'Wait a moment while Scram! scans...';

    msg.appendChild(spinner);
    msg.appendChild(text);
    document.body.appendChild(msg);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  return msg;
}

function showScanningMessage() {
  const msg = createScanningMessage();
  msg.style.backgroundColor = '#ff5555';
  const spinner = document.getElementById('scram-spinner');
  if (spinner) spinner.style.display = 'block';

  const checkmark = document.getElementById('scram-checkmark');
  if (checkmark) checkmark.style.display = 'none';

  const text = document.getElementById('scram-msg-text');
  if (text) text.innerText = 'Wait a moment while Scram! scans...';

  msg.style.display = 'flex';
}

function showSuccessMessage() {
  const msg = createScanningMessage();
  msg.style.backgroundColor = '#4CAF50';

  const spinner = document.getElementById('scram-spinner');
  if (spinner) spinner.style.display = 'none';

  let checkmark = document.getElementById('scram-checkmark');
  if (!checkmark) {
    checkmark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    checkmark.setAttribute("id", "scram-checkmark");
    checkmark.setAttribute("width", "16");
    checkmark.setAttribute("height", "16");
    checkmark.setAttribute("viewBox", "0 0 24 24");
    checkmark.style.fill = "none";
    checkmark.style.stroke = "white";
    checkmark.style.strokeWidth = "3";
    checkmark.style.strokeLinecap = "round";
    checkmark.style.strokeLinejoin = "round";
    checkmark.innerHTML = '<polyline points="20 6 9 17 4 12" />';
    msg.insertBefore(checkmark, msg.firstChild);
  }
  checkmark.style.display = 'inline-block';

  const text = document.getElementById('scram-msg-text');
  if (text) text.innerText = 'Scan complete!';

  showScanSummary();
}

function hideScanningMessage() {
  const msg = document.getElementById('scram-scanning-msg');
  if (msg) msg.style.display = 'none';
}

function showScanSummary() {
  clearSummaryMessage();

  const msg = document.createElement('div');
  msg.id = 'scram-summary-msg';
  msg.style.position = 'fixed';
  msg.style.top = '20px';
  msg.style.right = '20px';
  msg.style.backgroundColor = '#cd4343ff';
  msg.style.color = 'white';
  msg.style.padding = '15px 20px';
  msg.style.borderRadius = '8px';
  msg.style.fontSize = '14px';
  msg.style.fontWeight = 'bold';
  msg.style.zIndex = '999999';
  msg.style.display = 'flex';
  msg.style.flexDirection = 'column';
  msg.style.gap = '10px';
  msg.style.boxShadow = 'none';

  let summaryText = '';
  if (scamCount === 0) {
    summaryText = 'No scams found!';
  } else if (scamCount === 1) {
    summaryText = `1 scam posting found:`;
  } else {
    summaryText = `${scamCount} scam postings found:`;
  }

  const text = document.createElement('span');
  text.innerText = summaryText;
  msg.appendChild(text);

  scamJobs.forEach(job => {
    const jobElem = document.createElement('div');
    jobElem.style.display = 'flex';
    jobElem.style.alignItems = 'center';
    jobElem.style.gap = '8px';

    const icon = document.createElement('span');
    icon.innerText = '⚠️';
    jobElem.appendChild(icon);

    const jobText = document.createElement('span');
    jobText.innerText = job;
    jobElem.appendChild(jobText);

    msg.appendChild(jobElem);
  });

  document.body.appendChild(msg);

  // Auto hide after 10 seconds
  setTimeout(() => {
    clearSummaryMessage();
  }, 10000);
}

function addFeedbackButton(card) {
  if (card.querySelector('.scram-feedback')) return; // avoid duplicates

  const feedbackBtn = document.createElement('button');
  feedbackBtn.textContent = 'Report Feedback';
  feedbackBtn.className = 'scram-feedback';
  feedbackBtn.style.marginLeft = '10px';
  feedbackBtn.style.fontSize = '12px';
  feedbackBtn.style.cursor = 'pointer';
  feedbackBtn.style.padding = '4px 6px';
  feedbackBtn.style.border = 'none';
  feedbackBtn.style.backgroundColor = '#f44336';
  feedbackBtn.style.color = 'white';
  feedbackBtn.style.borderRadius = '4px';

  feedbackBtn.addEventListener('click', () => {
    const jobTitle = card.querySelector('.jobTitle')?.innerText || 'Unknown Job';
    const jobText = card.innerText;

    sendFeedback(jobTitle, jobText);
  });

  // Insert after jobTitle or h2 element
  const insertAfter = card.querySelector('.jobTitle') || card.querySelector('h2');
  if (insertAfter) {
    insertAfter.parentElement.appendChild(feedbackBtn);
  } else {
    card.appendChild(feedbackBtn);
  }
}

const jobCards = document.querySelectorAll('[data-testid="jobsearch-SerpJobCard"], .job_seen_beacon');
jobCards.forEach(card => {
  observer.observe(card);
  addFeedbackButton(card);  // Add this line to insert feedback button
});


function sendFeedback(jobTitle, jobText) {
  fetch('https://scram-production.up.railway.app/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_title: jobTitle,
      job_description: jobText,
      feedback_type: 'report'
    })
  })
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(data => alert('Thanks for your feedback!'))
  .catch(err => alert('Error sending feedback, please try again.'));
}


function clearSummaryMessage() {
  const msg = document.getElementById('scram-summary-msg');
  if (msg) msg.remove();
}
