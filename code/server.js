const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Import path for serving static files
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files (like HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public'))); // Assuming your static files are in a 'public' folder

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI("...........");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define a route for POST requests
app.post('/api/generate', async (req, res) => {
    const prompt = `As a medical assistant, respond to the following question: ${req.body.prompt}`;

    try {
        const result = await model.generateContent(prompt);
        res.json({ result: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

// Define a root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve your HTML file
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

