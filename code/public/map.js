let map;
let markers = [];

// Function to get zone color based on cases
function getZoneColor(cases) {
    if (cases > 100000) return 'red';
    if (cases > 50000) return 'orange';
    return 'green';
}

// Function to get circle radius based on cases
function getCircleRadius(cases) {
    return cases * 0.1; // Adjust the multiplier as needed
}

// Function to get coordinates for a city or state
async function getCoordinates(location) {
    const response = await fetch(`/api/location?place=${location}`);
    const data = await response.json();
    return { lat: data.lat, lng: data.lng };
}

// Main function to load the map
async function loadMap() {
    const location = document.getElementById('locationInput').value;
    const mapContainer = document.getElementById('map');
    const indexContainer = document.getElementById('index');

    if (!location) {
        alert('Please enter a location');
        return;
    }

    console.log(`Searching for location: ${location}`);

    // Get coordinates for the entered location
    const geocodeResponse = await fetch(`/api/location?place=${location}`);
    const geocodeData = await geocodeResponse.json();

    if (!geocodeData || geocodeResponse.status === 404) {
        alert('Location not found');
        return;
    }

    // Show the map container if hidden
    mapContainer.style.display = 'block';
    indexContainer.style.display = 'block';

    // Initialize the map or set the new view
    if (!map) {
        map = L.map('map').setView([geocodeData.lat, geocodeData.lng], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        console.log('Map initialized');
    } else {
        map.setView([geocodeData.lat, geocodeData.lng], 10);
        console.log('Map view updated');
    }

    // Clear previous layers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Fetch COVID-19 data for the entered location and display it on the map
    const covidResponse = await fetch('/api/covid-data');
    const covidData = await covidResponse.json();

    console.log('COVID-19 Data:', covidData);

    // Filter data based on the city/state input
    const filteredData = covidData.filter(zone => {
        const cityMatch = zone.city && zone.city.trim().toLowerCase() === location.toLowerCase().trim();
        const stateMatch = zone.state && zone.state.trim().toLowerCase() === location.toLowerCase().trim();
        return cityMatch || stateMatch;
    });

    console.log('Filtered Data:', filteredData); // Debugging line

    if (filteredData.length === 0) {
        alert('No data found for this location');
        return;
    }

    for (const zone of filteredData) {
        const color = getZoneColor(zone.cases); // Use lowercase 'cases'
        const coordinates = await getCoordinates(`${zone.city}, ${zone.state}`);
        
        if (coordinates.lat && coordinates.lng) { // Check if coordinates are valid
            const circle = L.circle([coordinates.lat, coordinates.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
                radius: Math.max(getCircleRadius(zone.cases), 100) // Ensure a minimum radius
            }).addTo(map).bindPopup(
                `<b>${zone.city}, ${zone.state}</b><br>
                Cases: ${zone.cases}<br>
                Deaths: ${zone.deaths}<br>
                Recovered: ${zone.recovered}`
            );

            // Add each marker to the markers array
            markers.push(circle);
        } else {
            console.error(`Invalid coordinates for ${zone.City}, ${zone.State}`);
        }
    }

    // Show index with scale on the side of the map
    indexContainer.innerHTML = `
        <h2>Covid-19 Cases</h2>
        <br>
        <h3>Zone Index</h3>
        <br>
        <ul>
            <li><span style="background-color: red; padding: 5px 10px;"></span>Red: > 100,000 cases</li>
             <br>
            <li><span style="background-color: orange; padding: 5px 10px;"></span>Orange: 50,000 - 100,000 cases</li>
             <br>
            <li><span style="background-color: green; padding: 5px 10px;"></span>Green: < 50,000 cases</li>
        </ul>

    `;
}


// Event listener for the location input submission
document.getElementById('searchButton').addEventListener('click', loadMap);
