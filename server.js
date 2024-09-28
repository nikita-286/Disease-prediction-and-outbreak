const express = require('express');
const { calculateOutbreakRisk } = require('./predictionModel');

const app = express();
app.use(express.json());

app.post('/predict', (req, res) => {
    const { temperature, humidity, populationDensity } = req.body;

    // Call the prediction model logic
    const { confidenceScore, outbreakLikelihood, predictedDisease } = calculateOutbreakRisk(
        parseFloat(temperature), 
        parseFloat(humidity), 
        parseInt(populationDensity)
    );

    // Send back the prediction results to the frontend
    res.json({
        confidenceScore,
        outbreakLikelihood,
        predictedDisease
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
