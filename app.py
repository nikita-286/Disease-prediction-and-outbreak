from flask import Flask, render_template, request, jsonify, redirect
import spacy
import mysql.connector
import requests


app = Flask(__name__, static_folder='public/static', template_folder='public/templates')

# Load spaCy model for NLP
nlp = spacy.load('en_core_web_sm')

# Connect to your MySQL database
def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',         # Replace with your MySQL username
        password='Root@1234',# Replace with your MySQL password
        database='disease'   # Replace with your MySQL database name
    )

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
    data = request.get_json()
    travel_history = data.get('travel_history')

    # Process the travel history and extract outbreak information
    outbreak_info = analyze_travel_history(travel_history)

    # Example response structure
    return jsonify({
        'places_visited': outbreak_info['places_visited'],
        'outbreak_info': outbreak_info['outbreak_info']  # Make sure this is a dict
    })

def analyze_travel_history(travel_history):
    # Extract places from travel history (this is a simple example)
    places_visited = []  # Populate this list based on your NLP logic
    doc = nlp(travel_history)
    for ent in doc.ents:
        if ent.label_ == "GPE":  # Geopolitical Entity
            places_visited.append(ent.text)
    
    # Get outbreak information based on places visited
    outbreak_info = get_outbreak_info(places_visited)

    return {
        'places_visited': places_visited,
        'outbreak_info': outbreak_info
    }


# Fetch outbreak information from the database based on visited places
def get_outbreak_info(places_visited):
    outbreak_info = {}
    db_connection = get_db_connection()
    cursor = db_connection.cursor()

    for place in places_visited:
        cursor.execute("SELECT disease, cases, deaths, new_cases FROM outbreaks WHERE country = %s", (place,))
        results = cursor.fetchall()  # Fetch all results

        if results:  # If there are any results for the place
            for result in results:
                outbreak_info[place] = {
                    "disease": result[0],
                    "cases": result[1],
                    "deaths": result[2],
                    "new_cases": result[3]
                }

    cursor.close()  # Close the cursor after processing all results
    db_connection.close()  # Close the database connection
    return outbreak_info


# Predict function combining environmental factors and travel history
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    temperature = data.get('temperature')
    humidity = data.get('humidity')
    population_density = data.get('population_density')

    # Make sure to get the outbreak_info from the correct source
    outbreak_info_response = requests.post('http://localhost:5000/process_travel_history', json=data)
    outbreak_info = outbreak_info_response.json().get('outbreak_info')  # This should be a dict

    # Check if outbreak_info is a dictionary
    if not isinstance(outbreak_info, dict):
        return jsonify({'error': 'Outbreak info is not available.'}), 400

    prediction = combine_factors(temperature, humidity, population_density, outbreak_info)

    return jsonify({'prediction': prediction})



# Combine environmental factors and travel history for final prediction
def combine_factors(temperature, humidity, population_density, outbreak_info):
    if outbreak_info:
        return f"Outbreak detected: {', '.join([info['disease'] for info in outbreak_info.values()])}, considering environmental factors."
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
