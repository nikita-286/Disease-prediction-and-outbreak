const express = require('express');
const axios = require('axios');
const XLSX = require('xlsx');
require('dotenv').config();
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + 'home.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  
// Endpoint to fetch COVID-19 data from Excel file
app.get('/api/covid-data', (req, res) => {
    try {
        const workbook = XLSX.readFile('./public/data1.xlsx'); // Update with your Excel file path
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(sheet);
        console.log('COVID-19 Data:', data); // Log the data
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

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
