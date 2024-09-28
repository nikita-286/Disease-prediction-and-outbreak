// Event listener for form submission
document.getElementById('data-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    const data = {
        temperature: document.getElementById('temperature').value,
        humidity: document.getElementById('humidity').value,
        populationDensity: document.getElementById('populationDensity').value,
        travelHistory: document.getElementById('travelHistoryText').value, // Fixed travelHistory input
    };

    // Ensure valid data
    if (!data.temperature || !data.humidity || !data.populationDensity) {
        alert('Please fill in all the required fields.');
        return;
    }

    // Fetch prediction data
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch prediction');
        }
        return response.json();
    })
    .then(result => {
        // Store the result in localStorage to access on the results page
        localStorage.setItem('predictionResult', JSON.stringify(result));
        window.location.href = '/results'; // Redirect to results page
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting prediction data. Please try again.');
    });
});

// On the results page, display the prediction results
if (window.location.pathname === '/results') {
    const result = JSON.parse(localStorage.getItem('predictionResult'));

    if (result) {
        document.getElementById('result').innerHTML = `
            <h2>Prediction: ${result.prediction}</h2>
            <h3>Confidence Score: ${result.confidenceScore}</h3>
            <h4>Outbreak Information:</h4>
            <ul>
                ${result.outbreakInfo ? Object.entries(result.outbreakInfo).map(([region, info]) => `<li>${region}: ${info}</li>`).join('') : '<li>No outbreak information available</li>'}
            </ul>
            <h4>Additional Information:</h4>
            <p>${result.additionalInfo || 'No additional information available'}</p>
        `;
    } else {
        document.getElementById('result').innerHTML = '<p>No results available.</p>';
    }
}
