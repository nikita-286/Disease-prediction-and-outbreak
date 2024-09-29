const hospitals = [
    // Hospitals in Mumbai
    { name: 'AIIMS Delhi', coords: [28.5880, 77.2181], availableBeds: 10, er_wait_time: 15, services: 'General, ICU, Trauma', contact: '011-26588500' },
    { name: 'Fortis Hospital Mulund', coords: [19.1497, 72.9475], availableBeds: 5, er_wait_time: 10, services: 'General, Surgical', contact: '022-4002-4040' },
    { name: 'Jaslok Hospital', coords: [18.9735, 72.8262], availableBeds: 3, er_wait_time: 15, services: 'General, Cardiology', contact: '022-6657-1666' },
    { name: 'Kokilaben Dhirubhai Ambani Hospital', coords: [19.1151, 72.8265], availableBeds: 8, er_wait_time: 12, services: 'General, ICU', contact: '022-4269-6000' },
    { name: 'Hiranandani Hospital', coords: [19.1549, 72.9382], availableBeds: 10, er_wait_time: 20, services: 'General, Surgical, Cardiology', contact: '022-2570-2300' },

    // Additional hospitals in Mumbai
    { name: 'Sir HN Reliance Foundation Hospital', coords: [19.2176, 72.8551], availableBeds: 5, er_wait_time: 20, services: 'General, Cardiology', contact: '022-6221-9999' },
    { name: 'Sanjivani Hospital', coords: [19.0842, 72.8268], availableBeds: 6, er_wait_time: 30, services: 'General, Surgery', contact: '022-2409-1584' },
    { name: 'Breach Candy Hospital', coords: [18.9674, 72.8178], availableBeds: 7, er_wait_time: 10, services: 'General, ICU', contact: '022-2363-6363' },
    
    // Hospitals in Thane
    { name: 'Thane Civil Hospital', coords: [19.1960, 72.9630], availableBeds: 20, er_wait_time: 5, services: 'General, Emergency', contact: '022-2536-1818' },
    { name: 'Hiranandani Hospital Thane', coords: [19.1843, 72.9733], availableBeds: 10, er_wait_time: 15, services: 'General, Cardiology', contact: '022-2576-0011' },
    { name: 'Fortis Hospital, Thane', coords: [19.1961, 72.9695], availableBeds: 8, er_wait_time: 10, services: 'General, Surgical', contact: '022-6131-2323' },
    { name: 'Vedant Multispeciality Hospital', coords: [19.1820, 72.9615], availableBeds: 6, er_wait_time: 8, services: 'General, Emergency', contact: '022-2542-2222' },
    { name: 'Kakade Hospital', coords: [19.2023, 72.9766], availableBeds: 4, er_wait_time: 20, services: 'General, Trauma', contact: '022-2542-2223' },
    { name: 'Shree Vishwa Hospital', coords: [19.2050, 72.9830], availableBeds: 5, er_wait_time: 12, services: 'General, Surgical', contact: '022-2545-1111' },
];

const vaccinationCenters = [
    { name: 'Mumbai Vaccination Center 1', coords: [19.0760, 72.8777], contact: '022-1234-5678' },
    { name: 'Mumbai Vaccination Center 2', coords: [19.0670, 72.9000], contact: '022-2233-4455' },
    { name: 'Fortis Vaccination Center', coords: [19.1497, 72.9475], contact: '022-4002-4040' },
    { name: 'Thane Vaccination Center 1', coords: [19.1960, 72.9630], contact: '022-2536-1818' },
];

let map;
let userMarker;

// Initialize the map when the page loads
const initMap = () => {
    map = L.map('map').setView([19.0760, 72.8777], 12); // Centered on Mumbai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    addMarkers();
};

// Add all hospitals and vaccination centers to the map
const addMarkers = () => {
    hospitals.forEach(hospital => {
        const markerColor = hospital.availableBeds > 0 ? 'green' : hospital.er_wait_time <= 15 ? 'yellow' : 'red';

        const marker = L.marker(hospital.coords).addTo(map);
        marker.bindPopup(`
            <div>
                <strong>${hospital.name}</strong><br>
                Available Beds: ${hospital.availableBeds}<br>
                ER Wait Time: ${hospital.er_wait_time ? hospital.er_wait_time + ' minutes' : 'N/A'}<br>
                Services: ${hospital.services ? hospital.services : 'N/A'}<br>
                Contact: ${hospital.contact}
            </div>
        `);

        marker.setIcon(L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; width: 10px; height: 10px; border-radius: 50%;"></div>`
        }));

        // Add hospital to the list
        const hospitalList = document.getElementById('hospitalList');
        const listItem = document.createElement('li');
        listItem.className = 'hospital-item';
        listItem.innerHTML = `
            <h3>${hospital.name}</h3>
            <p class="${hospital.availableBeds > 0 ? 'available' : 'unavailable'}">
                ${hospital.availableBeds > 0 ? 'Available Beds: ' + hospital.availableBeds : 'No Beds Available'}
            </p>
            <p>ER Wait Time: ${hospital.er_wait_time ? hospital.er_wait_time + ' minutes' : 'N/A'}</p>
        `;
        hospitalList.appendChild(listItem);
    });

    vaccinationCenters.forEach(center => {
        const marker = L.marker(center.coords).addTo(map);
        marker.bindPopup(`
            <div>
                <strong>${center.name}</strong><br>
                Contact: ${center.contact}
            </div>
        `);
    });
};

// Locate the user and show nearby hospitals
const locateUser = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userCoords = [position.coords.latitude, position.coords.longitude];

            // Remove existing user marker if it exists
            if (userMarker) {
                map.removeLayer(userMarker);
            }

            // Add new user marker to map
            userMarker = L.marker(userCoords).addTo(map).bindPopup('You are here!').openPopup();
            map.setView(userCoords, 14); // Zoom into user location

            addNearbyHospitals(userCoords); // Display nearby hospitals instantly
        }, (error) => {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert('User denied the request for Geolocation.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert('Location information is unavailable.');
                    break;
                case error.TIMEOUT:
                    alert('The request to get user location timed out.');
                    break;
                case error.UNKNOWN_ERROR:
                    alert('An unknown error occurred.');
                    break;
            }
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
};

// Add hospitals near the user's location
const addNearbyHospitals = (userCoords) => {
    const hospitalList = document.getElementById('hospitalList');
    hospitalList.innerHTML = ''; // Clear previous list

    hospitals.forEach(hospital => {
        const distance = getDistance(userCoords, hospital.coords);
        const markerColor = hospital.availableBeds > 0 ? 'green' : hospital.er_wait_time <= 15 ? 'yellow' : 'red';

        // Only show hospitals within 10 km
        if (distance <= 10) {
            const listItem = document.createElement('li');
            listItem.className = 'hospital-item';
            listItem.innerHTML = `
                <h3>${hospital.name}</h3>
                <p>${distance.toFixed(2)} km away</p>
                <p class="${hospital.availableBeds > 0 ? 'available' : 'unavailable'}">
                    ${hospital.availableBeds > 0 ? 'Available Beds: ' + hospital.availableBeds : 'No Beds Available'}
                </p>
                <p>ER Wait Time: ${hospital.er_wait_time ? hospital.er_wait_time + ' minutes' : 'N/A'}</p>
            `;
            hospitalList.appendChild(listItem);
        }
    });
};

// Calculate the distance between two coordinates (Haversine formula)
const getDistance = (coords1, coords2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(coords2[0] - coords1[0]);
    const dLon = toRad(coords2[1] - coords1[1]);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(coords1[0])) * Math.cos(toRad(coords2[0])) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Convert degrees to radians
const toRad = (value) => {
    return value * Math.PI / 180;
};

// Bind the locate user button
document.getElementById('searchBtn').addEventListener('click', locateUser);

// Initialize the map
window.onload = initMap;