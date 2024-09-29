const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Home route redirects to the input page
app.get('/', (req, res) => {
    res.redirect('/input'); // Redirect to the input page
});

// Input form page (serving the input.html)
app.get('/input', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'input.html'));
});

// Results page (serving the results.html)
app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

// Process travel history
app.post('/process_travel_history', (req, res) => {
    const travel_history = req.body.travel_history;

    // Dummy outbreak information (replace with actual logic)
    const outbreak_info = {
        "Brazil": {
            "disease": "Dengue Fever",
            "cases": 1500,
            "deaths": 15,
            "new_cases": 300
        },
        "China": {
            "disease": "COVID-19",
            "cases": 50000,
            "deaths": 1000,
            "new_cases": 500
        }
    };
    
    res.json({
        "places_visited": ["Brazil", "China"],
        "outbreak_info": outbreak_info
    });
});

// Prediction route
app.post('/predict', (req, res) => {
    const data = req.body;
    const temperature = data.temperature;
    const humidity = data.humidity;
    const population_density = data.populationDensity;
    
    // Example prediction logic
    let predicted_diseases = [];
    let outbreak_likelihood = "Low";
    let confidence_score = 0.75;
    
    if (temperature > 30 && humidity > 70) {
        predicted_diseases.push("Dengue Fever");
        outbreak_likelihood = "Medium";
    }
    
    if (population_density > 2000) {
        predicted_diseases.push("COVID-19");
        outbreak_likelihood = "High";
    }

    res.json({
        predicted_diseases,
        outbreak_likelihood,
        confidence_score
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
