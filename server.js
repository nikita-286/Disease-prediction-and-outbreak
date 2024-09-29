const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Saloni@1234', // Replace with your MySQL password
    database: 'emergency_db' // Make sure this matches your database name
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
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

// Route for the root URL to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
