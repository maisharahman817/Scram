async function checkJobPosting(jobText) {
  try {
    const response = await fetch('http://localhost:5001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_description: jobText })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();

    console.log('Prediction:', result.prediction);
    console.log('Confidence:', result.confidence);

    // Display the result in your popup or page
    document.getElementById('result').innerText = 
      `Prediction: ${result.prediction} (Confidence: ${result.confidence})`;
  } catch (error) {
    console.error('Error:', error);
  }
}
