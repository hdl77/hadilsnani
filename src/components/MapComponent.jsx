// MapComponent.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction pour l'icône de marqueur par défaut
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

// Créer une icône personnalisée pour le client
const clientIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Composant personnalisé pour gérer le zoom de la carte
const SetViewOnWilayaChange = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
        if (coordinates) {
            map.setView(coordinates, 8); // Ajustez le niveau de zoom selon vos préférences
        }
    }, [coordinates, map]);

    return null;
};

const MapComponent = ({ departureWilaya, clientWilaya }) => {
    const [departureCoordinates, setDepartureCoordinates] = useState(null);
    const [clientCoordinates, setClientCoordinates] = useState(null);

    // Fonction pour obtenir les coordonnées d'une wilaya (vous devrez implémenter ceci)
    const getCoordinatesForWilaya = async (wilaya) => {
        // Ici, vous feriez un appel à une API de géocodage
        // ou utiliseriez un tableau de coordonnées prédéfini pour les wilayas algériennes.
        // C'est une fonction asynchrone car la récupération de données prend du temps.

        // Exemple de données statiques (à remplacer par une vraie logique de géocodage)
        const wilayaCoordinates = {
            'Alger': { lat: 36.75, lng: 3.05 },
            'Oran': { lat: 35.70, lng: -0.64 },
            'Constantine': { lat: 36.37, lng: 6.61 },
            'Adrar': { lat: 27.87, lng: -0.29 },
            'Chlef': { lat: 36.17, lng: 1.34 },
            'Laghouat': { lat: 33.80, lng: 2.87 },
            'Oum El Bouaghi': { lat: 35.87, lng: 7.12 },
            'Batna': { lat: 35.55, lng: 6.17 },
            'Béjaïa': { lat: 36.75, lng: 5.07 },
            'Biskra': { lat: 34.85, lng: 5.73 },
            'Béchar': { lat: 31.62, lng: -2.22 },
            'Blida': { lat: 36.47, lng: 2.83 },
            'Bouira': { lat: 36.37, lng: 3.90 },
            'Tlemcen': { lat: 34.88, lng: -1.31 },
            'Tébessa': { lat: 35.40, lng: 8.12 },
            'Mostaganem': { lat: 35.93, lng: 0.08 },
            'Sétif': { lat: 36.19, lng: 5.41 },
            'Saïda': { lat: 34.83, lng: -0.15 },
            'Skikda': { lat: 36.91, lng: 6.91 },
            'Sidi Bel Abbès': { lat: 33.70, lng: -0.64 },
            'Annaba': { lat: 36.90, lng: 7.76 },
            'Guelma': { lat: 36.46, lng: 7.43 },
            'Médéa': { lat: 36.27, lng: 2.75 },
            'Mascara': { lat: 35.40, lng: -0.14 },
            'Ouargla': { lat: 31.95, lng: 5.32 },
            'El Bayadh': { lat: 33.68, lng: 1.02 },
            'Illizi': { lat: 26.48, lng: 8.47 },
            'Bordj Bou Arréridj': { lat: 36.07, lng: 4.76 },
            'Boumerdès': { lat: 36.76, lng: 3.48 },
            'El Tarf': { lat: 36.77, lng: 8.31 },
            'Tindouf': { lat: 27.71, lng: -8.14 },
            'Tissemsilt': { lat: 35.60, lng: 1.81 },
            'El Oued': { lat: 33.37, lng: 6.87 },
            'Khenchela': { lat: 35.44, lng: 7.14 },
            'Souk Ahras': { lat: 36.28, lng: 7.95 },
            'Tipaza': { lat: 36.59, lng: 2.44 },
            'Mila': { lat: 36.45, lng: 6.26 },
            'Aïn Defla': { lat: 36.26, lng: 1.96 },
            'Naâma': { lat: 33.28, lng: -2.93 },
            'Aïn Témouchent': { lat: 35.30, lng: -1.15 },
            'Ghardaïa': { lat: 32.48, lng: 3.67 },
            'Relizane': { lat: 35.73, lng: 0.55 },
            'Timimoun': { lat: 29.27, lng: 0.23 },
            'Bordj Badji Mokhtar': { lat: 21.37, lng: 0.91 },
            'Ouled Djellal': { lat: 33.98, lng: 5.39 },
            'Béni Abbès': { lat: 30.12, lng: -2.17 },
            'In Salah': { lat: 27.20, lng: 2.49 },
            'In Guezzam': { lat: 19.57, lng: 5.77 },
            'Touggourt': { lat: 33.12, lng: 6.06 },
            'Djanet': { lat: 24.55, lng: 9.49 },
            'El M\'Ghair': { lat: 33.95, lng: 6.83 },
            'El Meniaa': { lat: 30.58, lng: 2.88 },
        };
        return wilayaCoordinates[wilaya] || null;
    };

    useEffect(() => {
        const fetchDepartureCoordinates = async () => {
            if (departureWilaya) {
                const coords = await getCoordinatesForWilaya(departureWilaya);
                setDepartureCoordinates(coords);
            } else {
                setDepartureCoordinates(null);
            }
        };
        fetchDepartureCoordinates();
    }, [departureWilaya]);

    useEffect(() => {
        const fetchClientCoordinates = async () => {
            if (clientWilaya) {
                const coords = await getCoordinatesForWilaya(clientWilaya);
                setClientCoordinates(coords);
            } else {
                setClientCoordinates(null);
            }
        };
        fetchClientCoordinates();
    }, [clientWilaya]);

    return (
        <MapContainer center={[28.0339, 1.6596]} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {departureCoordinates && (
                <Marker position={[departureCoordinates.lat, departureCoordinates.lng]}>
                    <Popup>
                        Wilaya de départ: {departureWilaya}
                    </Popup>
                </Marker>
            )}
            {clientCoordinates && (
                <Marker position={[clientCoordinates.lat, clientCoordinates.lng]} icon={clientIcon}>
                    <Popup>
                        Wilaya du client: {clientWilaya}
                    </Popup>
                </Marker>
            )}
            {departureCoordinates && <SetViewOnWilayaChange coordinates={departureCoordinates} />}
            {clientCoordinates && <SetViewOnWilayaChange coordinates={clientCoordinates} />}
        </MapContainer>
    );
};

export default MapComponent;