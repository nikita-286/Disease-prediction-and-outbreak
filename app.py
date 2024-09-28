from flask import Flask, render_template, request, jsonify, redirect
import spacy

app = Flask(__name__, static_folder='public/static', template_folder='public/templates')

# Load spaCy model for NLP
nlp = spacy.load('en_core_web_sm')

# Mock data for regions with outbreaks
regions_with_outbreaks = {
    'India': 'Dengue outbreak',
    'Brazil': 'Zika virus detected',
    'Africa': 'Ebola virus risk',
    'Italy': 'Influenza cases rising',
    'China': 'COVID-19 reported',
}

# Home route redirects to input page
@app.route('/')
def home():
    return redirect('/input')

# Input form page
@app.route('/input')
def input_page():
    return render_template('input.html')

@app.route('/process_travel_history', methods=['POST'])
def process_travel_history():
    data = request.json
    travel_history_text = data.get('travel_history', '')

    # Use spaCy NLP to analyze the travel history text
    doc = nlp(travel_history_text)

    # Extract places mentioned in the text
    places_visited = [ent.text for ent in doc.ents if ent.label_ == 'GPE']  # GPE: Geopolitical entities (e.g., countries, cities)

    # Find outbreak information for places visited
    outbreak_info = {}
    for place in places_visited:
        if place in regions_with_outbreaks:
            outbreak_info[place] = regions_with_outbreaks[place]

    # Return the results as JSON
    return jsonify({
        'places_visited': places_visited,
        'outbreak_info': outbreak_info
    })


# Predict function combining environmental factors and travel history
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    temperature = data.get('temperature')
    humidity = data.get('humidity')
    population_density = data.get('populationDensity')
    travel_history = data.get('travelHistory')

    # Analyze travel history using spaCy NLP
    outbreak_info = process_travel_history(travel_history)

    # Combine environmental factors with travel history
    prediction = combine_factors(temperature, humidity, population_density, outbreak_info)

    # Mock confidence score
    confidence_score = 0.85  # This would come from a real model in a production setting

    # Return prediction result as JSON
    return jsonify({"prediction": prediction, "confidenceScore": confidence_score})

# Route to process travel history and return outbreak info
def process_travel_history(travel_history):
    # Using spaCy NLP to analyze travel history text (e.g., extract locations)
    doc = nlp(travel_history)
    regions_visited = [ent.text for ent in doc.ents if ent.label_ == "GPE"]  # GPE: Geo-political entities

    # Check if any region visited matches with outbreak data
    for region in regions_visited:
        if region in regions_with_outbreaks:
            return regions_with_outbreaks[region]
    return "No known outbreaks reported"

# Combine environmental factors and travel history for final prediction
def combine_factors(temperature, humidity, population_density, outbreak_info):
    # Example logic combining factors (this is mock logic)
    if outbreak_info != "No known outbreaks reported":
        return f"{outbreak_info}, considering environmental factors."
    elif int(temperature) > 30 and int(humidity) > 70:
        return "High risk due to environmental factors"
    elif int(population_density) > 1000:
        return "Risk due to high population density"
    else:
        return "Low risk"

# Results page route
@app.route('/results', methods=['GET'])
def results():
    prediction = "Outbreak Likely"  # This would come from the prediction logic
    confidenceScore = "0.85"  # Mock confidence score
    return jsonify({"prediction": prediction, "confidenceScore": confidenceScore})

if __name__ == '__main__':
    app.run(debug=True)
