import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Ship Icon
const truckIcon = new L.DivIcon({
    html: `
        <div class="map-marker-container">
            <div class="marker-pulse"></div>
            <div class="map-marker-icon-real">
                <i class="fas fa-truck"></i>
            </div>
        </div>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const ChangeView = ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
};

const SmartMap = ({ shipment }) => {
    const [currentPos, setCurrentPos] = useState(
        shipment?.currentLocation?.lat ? [shipment.currentLocation.lat, shipment.currentLocation.lng] : [24.8607, 67.0011]
    );
    const destination = shipment?.destinationLocation?.lat ? [shipment.destinationLocation.lat, shipment.destinationLocation.lng] : [31.5204, 74.3587]; // Default to Lahore if not set

    useEffect(() => {
        if (shipment?.currentLocation?.lat) {
            setCurrentPos([shipment.currentLocation.lat, shipment.currentLocation.lng]);
        }
    }, [shipment]);

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <MapContainer center={currentPos} zoom={6} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <ChangeView center={currentPos} />

                {/* Current Location Marker */}
                <Marker position={currentPos} icon={truckIcon}>
                    <Popup>
                        <strong>Current Location</strong><br />
                        {shipment?.currentLocation?.address || 'In Transit'}
                    </Popup>
                </Marker>

                {/* Destination Marker */}
                <Marker position={destination}>
                    <Popup>
                        <strong>Destination</strong><br />
                        {shipment?.destinationLocation?.address || 'Karachi Port'}
                    </Popup>
                </Marker>

                {/* Path Line */}
                <Polyline 
                    positions={[currentPos, destination]} 
                    color="#ff6b35" 
                    dashArray="10, 10"
                    weight={3}
                />
            </MapContainer>
        </div>
    );
};

export default SmartMap;
