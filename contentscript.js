(async () => {
  console.log("Checking content script");

  const FLAG_CLASS = 'fake-job-flag';
  const processedJobs = new Set();
  let scamCount = 0;  // Track the number of scam postings
  let scamJobs = [];  // Store job titles of scam postings


function createScanningMessage() {
  let msg = document.getElementById('scram-scanning-msg');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'scram-scanning-msg';
    msg.style.position = 'fixed';
    msg.style.bottom = '20px';
    msg.style.right = '20px';
    msg.style.backgroundColor = '#ff5555'; // red background initially
    msg.style.color = 'white';
    msg.style.padding = '10px 15px';
    msg.style.borderRadius = '8px';
    msg.style.fontSize = '14px';
    msg.style.fontWeight = 'bold';
    msg.style.zIndex = '999999';
    msg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    msg.style.display = 'flex';
    msg.style.alignItems = 'center';
    msg.style.gap = '10px';

    // Create the spinner circle
    const spinner = document.createElement('div');
    spinner.id = 'scram-spinner';
    spinner.style.border = '3px solid white';
    spinner.style.borderTop = '3px solid rgba(255,255,255,0.3)';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '16px';
    spinner.style.height = '16px';
    spinner.style.animation = 'spin 1s linear infinite';

    // Create text node
    const text = document.createElement('span');
    text.id = 'scram-msg-text';
    text.innerText = 'Wait a moment while Scram! scans...';

    msg.appendChild(spinner);
    msg.appendChild(text);
    document.body.appendChild(msg);

    // Add keyframes for spinner animation to the document
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

  // Reset to loading state
  msg.style.backgroundColor = '#ff5555'; // red
  const spinner = document.getElementById('scram-spinner');
  if (spinner) spinner.style.display = 'block';

  let checkmark = document.getElementById('scram-checkmark');
  if (checkmark) checkmark.style.display = 'none';

  const text = document.getElementById('scram-msg-text');
  if (text) text.innerText = 'Wait a moment while Scram! scans...';

  msg.style.display = 'flex';
}
function showScanSummary() {
  const msg = document.createElement('div');
  msg.id = 'scram-summary-msg';
  msg.style.position = 'fixed';
  msg.style.top = '20px'; // Position at the top-right corner
  msg.style.right = '20px';
  msg.style.backgroundColor = '#ff5555'; // Set to red background, same as scanning box
  msg.style.color = 'white';
  msg.style.padding = '15px 20px';
  msg.style.borderRadius = '8px';
  msg.style.fontSize = '14px';
  msg.style.fontWeight = 'bold';
  msg.style.zIndex = '999999';
  msg.style.display = 'flex';
  msg.style.flexDirection = 'column'; // Stack items vertically
  msg.style.gap = '10px';
  
  // Remove the box shadow
  msg.style.boxShadow = 'none';

  // Create the summary text
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

  // Stack job postings with warning emojis
  scamJobs.forEach(job => {
    const jobElem = document.createElement('div');
    jobElem.style.display = 'flex';
    jobElem.style.alignItems = 'center';
    jobElem.style.gap = '8px';

    const warningIcon = document.createElement('span');
    warningIcon.innerHTML = '⚠️'; // Warning emoji
    jobElem.appendChild(warningIcon);

    const jobText = document.createElement('span');
    jobText.innerText = job;
    jobElem.appendChild(jobText);

    msg.appendChild(jobElem);
  });

  document.body.appendChild(msg);

  // Hide the summary after 10 seconds
  setTimeout(() => {
    msg.remove(); // Removes the entire message after 10 seconds
  }, 10000); // 10 seconds timeout (adjust as needed)
}


function showSuccessMessage() {
  const msg = createScanningMessage();

  // Change to success state
  msg.style.backgroundColor = '#4CAF50'; // green

  const spinner = document.getElementById('scram-spinner');
  if (spinner) spinner.style.display = 'none';

  // Add checkmark if it doesn’t exist yet
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

  // Show the final summary message
  showScanSummary();
}

function hideScanningMessage() {
  const msg = document.getElementById('scram-scanning-msg');
  if (msg) msg.style.display = 'none';
}

  // Flag creation stays the same:
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

  // Track scam job
  scamCount++;
  scamJobs.push(card.querySelector('.jobTitle').innerText || 'Unknown Job');
}


  async function processJobCard(card) {
  const jobText = card.innerText.trim();
  if (!jobText || processedJobs.has(jobText)) return;
  processedJobs.add(jobText);

  try {
    showScanningMessage();    // Show loading spinner message

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

    showSuccessMessage();    // Show checkmark success message
  } catch (err) {
    console.error("Error fetching prediction:", err);
    hideScanningMessage();   // Hide on error
  }
}


  // IntersectionObserver setup to watch job cards entering viewport
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        processJobCard(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -50% 0px' // triggers roughly when half the card is visible
  });

  // Start observing existing job cards on page load
  const jobCards = document.querySelectorAll('[data-testid="jobsearch-SerpJobCard"], .job_seen_beacon');
  jobCards.forEach(card => observer.observe(card));

  // MutationObserver to detect new job cards dynamically added later
  const container = document.querySelector('#mosaic-provider-jobcards') || document.body;
  const mutationObserver = new MutationObserver(mutations => {
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

  // REMOVE your old setInterval scan call entirely
  // intervalId = setInterval(scanJobPostings, 4000);
})();
