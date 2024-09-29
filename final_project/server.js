const express = require('express');
const axios = require('axios');
const XLSX = require('xlsx');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(cors());

// Serve static files (like HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Ayush@0401', // Replace with your MySQL password
    database: 'emergency_db' // Make sure this matches your database name
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
});

// Root route to serve home.html (main page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Route to serve the input form page
app.get('/input', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'input.html'));
});

// Route to serve the results page
app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

// Route to serve the map (outbreak detection)
app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

// Route to serve the chatbot
app.get('/chatbot', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatbot.html')); // Update to your chatbot HTML file
});

// Endpoint to fetch COVID-19 data from Excel file
app.get('/api/covid-data', (req, res) => {
    try {
        const workbook = XLSX.readFile('./public/data1.xlsx');
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log('COVID-19 Data:', data);
        res.json(data);
    } catch (error) {
        console.error('Error reading Excel file:', error);
        res.status(500).json({ message: 'Error reading data from Excel file' });
    }
});

// Endpoint to get location coordinates (India only)
app.get('/api/location', async (req, res) => {
    const place = req.query.place;
    const geocodeURL = `https://nominatim.openstreetmap.org/search?format=json&q=${place}&countrycodes=IN`;

    try {
        const response = await axios.get(geocodeURL);
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            res.json({ lat: parseFloat(lat), lng: parseFloat(lon) });
        } else {
            res.status(404).json({ message: 'Location not found' });
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
        res.status(500).json({ message: 'Error fetching location data' });
    }
});

// Endpoint to get hospitals from the database
app.get('/api/hospitals', (req, res) => {
    db.query('SELECT * FROM emergency_services', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Initialize the Google Generative AI for chatbot
const genAI = new GoogleGenerativeAI("AIzaSyA7xaBBwjqx5KtLqEyYfFtCeuK5j3mezzs");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Chatbot endpoint
app.post('/api/generate', async (req, res) => {
    const prompt = `As a medical assistant, respond to the following question: ${req.body.prompt}`;

    try {
        const result = await model.generateContent(prompt);
        res.json({ result: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate content' });
    }
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

// Recommendations route
app.post('/api/recommendations', (req, res) => {
    const outbreakLevel = req.body.outbreakLevel; // e.g., "low", "moderate", "high"

    // Sample recommendations based on outbreak level
    const recommendations = {
        low: "Maintain good hygiene. Consider vaccination.",
        moderate: "Practice social distancing and avoid crowded places.",
        high: "Quarantine if symptoms arise. Seek medical help immediately."
    };

    const response = recommendations[outbreakLevel] || "No recommendations available.";
    res.json({ recommendation: response });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
