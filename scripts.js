// Event listener for form submission
document.getElementById('data-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    const data = {
        temperature: document.getElementById('temperature').value,
        humidity: document.getElementById('humidity').value,
        populationDensity: document.getElementById('populationDensity').value,
        travel_history: document.getElementById('travelHistoryText').value, // Make it consistent
    };
    

    // Ensure valid data
    if (!data.temperature || !data.humidity || !data.populationDensity || !data.travelHistory) {
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
