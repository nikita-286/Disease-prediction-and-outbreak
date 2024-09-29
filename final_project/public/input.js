 // Process travel history using NLP (communicates with the server)
 function processTravelHistory() {
    const travelHistoryText = document.getElementById('travelHistoryText').value;

    fetch('/process_travel_history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ travel_history: travelHistoryText }),
    })
    .then(response => response.json())
    .then(data => {
        const travelResultDiv = document.getElementById('travel-result');
        let resultHtml = "<h3>Analysis Results:</h3>";
        resultHtml += "<p>Places Visited: " + data.places_visited.join(', ') + "</p>";
        resultHtml += "<p><strong>Outbreak Information:</strong></p>";
        for (const [place, info] of Object.entries(data.outbreak_info)) {
            resultHtml += `<p>${place}: Disease - ${info.disease}, Cases - ${info.cases}, Deaths - ${info.deaths}, New Cases - ${info.new_cases}</p>`;
        }
        travelResultDiv.innerHTML = resultHtml;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to handle form submission
function submitData() {
    const temperature = document.getElementById('temperature').value;
    const humidity = document.getElementById('humidity').value;
    const populationDensity = document.getElementById('populationDensity').value;
    const travelHistory = document.getElementById('travelHistoryText').value;

    const data = {
        temperature: temperature,
        humidity: humidity,
        populationDensity: populationDensity,
        travel_history: travelHistory,
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
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(result => {
        // Display results in modal
        displayResult(temperature, humidity, populationDensity, result);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting prediction data. Please try again.');
    });
}

// Function to display results in modal
function displayResult(temperature, humidity, populationDensity, data) {
    const modalResultDiv = document.getElementById('modalResult');
    modalResultDiv.innerHTML = `
        <p><strong>Temperature:</strong> ${temperature}°C</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Population Density:</strong> ${populationDensity}</p>
        <p><strong>Confidence Score:</strong> ${data.confidence_score}</p>
        <p><strong>Outbreak Likelihood:</strong> ${data.outbreak_likelihood}</p>
        <p><strong>Predicted Disease:</strong> ${data.predicted_diseases}</p>
    `;
    document.getElementById('resultModal').style.display = "block"; // Show modal
}

// Function to close the modal
function closeModal() {
    document.getElementById('resultModal').style.display = "none"; // Hide modal
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('resultModal');
    if (event.target === modal) {
        closeModal();
    }
};

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