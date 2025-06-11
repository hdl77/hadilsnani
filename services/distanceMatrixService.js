// services/distanceMatrixService.js
import axios from 'axios'; // Use ES module import for axios

// Fonction pour décoder la géométrie encodée de l'API OSRM (Polyline algorithm format)
function decodePolyline(encoded) {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat / 1E5, lng / 1E5]);
    }
    return points;
}

/**
 * Obtient le chemin détaillé d'une route via OSRM.
 * @param {Array<Array<number>>} coordinates - Tableau de paires [lat, lng] représentant les points de la route.
 * @returns {Object} Un objet contenant le chemin détaillé, la distance et la durée.
 */
export async function getDetailedRoutePath(coordinates) {
    if (!coordinates || coordinates.length < 2) {
        // Return a default structure for invalid input
        return { path: coordinates || [], distance: 0, duration: 0 };
    }

    // OSRM expects [lng, lat]
    const osrmCoords = coordinates.map(coord => `${coord[1]},${coord[0]}`).join(';');
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${osrmCoords}?geometries=polyline&overview=full&annotations=true`;

    try {
        const response = await axios.get(osrmUrl);
        if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            const path = decodePolyline(route.geometry);
            
            return {
                path: path,
                distance: route.distance,
                duration: route.duration
            };
        } else {
            throw new Error('No route found from OSRM.');
        }
    } catch (error) {
        console.error("Error fetching detailed route path from OSRM:", error.message);
        throw new Error("Could not get detailed route path from OSRM service.");
    }
}

/**
 * Obtient une matrice de distances et de durées entre plusieurs localisations via OSRM.
 * @param {Array<Object>} locations - Tableau d'objets { lat, lng } pour les localisations.
 * @returns {Object} Un objet contenant les matrices de distances et de durées.
 */
export async function getDistanceMatrix(locations) {
    if (!locations || locations.length === 0) {
        return { distances: [], durations: [] };
    }
    // OSRM expects [lng, lat]
    const osrmCoords = locations.map(loc => `${loc.lng},${loc.lat}`).join(';');
    const osrmUrl = `http://router.project-osrm.org/table/v1/driving/${osrmCoords}?annotations=duration,distance`;

    try {
        const response = await axios.get(osrmUrl);
        return {
            distances: response.data.distances,
            durations: response.data.durations
        };
    } catch (error) {
        console.error("Error fetching distance matrix from OSRM:", error.message);
        throw new Error("Could not get distance matrix from OSRM service.");
    }
}