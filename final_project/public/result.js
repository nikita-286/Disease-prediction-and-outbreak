document.getElementById('data-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    const data = {
        temperature: document.getElementById('temperature').value,
        humidity: document.getElementById('humidity').value,
        populationDensity: document.getElementById('populationDensity').value,
        travel_history: document.getElementById('travelHistoryText').value,
    };

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
        // Prepare popup content
        let popupContent = `
            <h2>Outbreak Likelihood: ${result.outbreak_likelihood} 
            | Predicted Diseases: ${result.predicted_diseases.join(', ') || 'None'}</h2>
            <p>Confidence Score: ${result.confidence_score}</p>
        `;

        // Show the popup with the result
        document.getElementById('result').innerHTML = popupContent;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting prediction data. Please try again.');
    });
});