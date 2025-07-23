(async () => {
  console.log("Checking content script");

  const FLAG_CLASS = 'fake-job-flag';

  function isAlreadyFlagged(el) {
    return el.querySelector(`.${FLAG_CLASS}`) !== null;
  }

  async function scanJobPostings() {
    const jobCards = document.querySelectorAll('[data-testid="jobsearch-SerpJobCard"], .job_seen_beacon');

    for (const card of jobCards) {
      if (isAlreadyFlagged(card)) continue;

      const jobText = card.innerText.trim();
      if (!jobText) continue;

      const result = await checkJobPosting(jobText);
      if (!result) continue;

      if (result.prediction.toLowerCase().includes('fake')) {
        addFlag(card, result);
      }
      console.log('Prediction result:', result);
    }
  }

  async function checkJobPosting(jobText) {
    try {
      console.log("Sending job description to model:", jobText);
      const response = await fetch('https://scram-j85q.onrender.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jobText })
      });

      if (!response.ok) throw new Error('API response not ok');
      const result = await response.json();
      return result;
    } catch (err) {
      console.error("Error fetching prediction:", err);
      return null;
    }
  }

  function addFlag(card, result) {
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
  }

  setInterval(scanJobPostings, 4000);
})();