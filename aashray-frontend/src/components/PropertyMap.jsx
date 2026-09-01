// src/components/PropertyMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// City Coordinates Dictionary for auto fallback
const CITY_COORDINATES = {
    goa: [15.518, 73.768],
    manali: [32.2432, 77.1892],
    jaipur: [26.9124, 75.7873],
    udaipur: [24.5854, 73.7125],
    delhi: [28.6139, 77.209],
    default: [20.5937, 78.9629] // Center of India
};

// Custom Glowing Neon Map Pin
const createCyberIcon = (price) => {
    return L.divIcon({
        className: 'custom-cyber-marker',
        html: `
      <div style="
        background: #060913;
        border: 2px solid #00f0ff;
        color: #00f0ff;
        padding: 4px 8px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 11px;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <i class="fa-solid fa-hotel" style="color: #00f0ff; font-size: 10px;"></i>
        <span>₹${price}</span>
      </div>
    `,
        iconSize: [60, 25],
        iconAnchor: [30, 12]
    });
};

const PropertyMap = ({ hotels, onSelectHotel }) => {
    // Determine map center based on filtered hotels
    const defaultCenter = hotels.length > 0 && hotels[0].city?.toLowerCase() in CITY_COORDINATES
        ? CITY_COORDINATES[hotels[0].city.toLowerCase()]
        : [22.3511, 78.6677];

    return (
        <div className="cyber-card p-2 p-md-3 overflow-hidden" style={{ height: '580px', width: '100%', position: 'relative' }}>
            <MapContainer
                center={defaultCenter}
                zoom={hotels.length === 1 ? 12 : 5}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    className="cyber-map-tiles"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {hotels.map((hotel, idx) => {
                    // Resolve Lat & Lng
                    let lat = hotel.latitude || hotel.lat;
                    let lng = hotel.longitude || hotel.lng;

                    if (!lat || !lng) {
                        const cityKey = hotel.city?.toLowerCase() || 'default';
                        const baseCoords = CITY_COORDINATES[cityKey] || CITY_COORDINATES.default;
                        // Add slight random offset so multiple hotels in the same city don't overlap exactly
                        lat = baseCoords[0] + (idx * 0.015 - 0.03);
                        lng = baseCoords[1] + (idx * 0.015 - 0.03);
                    }

                    return (
                        <Marker
                            key={hotel._id}
                            position={[lat, lng]}
                            icon={createCyberIcon(hotel.pricePerNight)}
                        >
                            <Popup>
                                <div style={{ maxWidth: '220px' }}>
                                    <img
                                        src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'}
                                        alt={hotel.name}
                                        style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                                    />
                                    <h6 style={{ color: '#ffffff', fontWeight: 'bold', margin: '0 0 4px 0', fontSize: '13px' }}>
                                        {hotel.name}
                                    </h6>
                                    <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 6px 0' }}>
                                        <i className="fa-solid fa-location-dot" style={{ color: '#00f0ff', marginRight: '4px' }}></i>
                                        {hotel.location}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '13px' }}>
                                            ₹{hotel.pricePerNight}<small style={{ color: '#94a3b8', fontSize: '10px' }}>/night</small>
                                        </span>
                                        <button
                                            onClick={() => onSelectHotel(hotel)}
                                            className="btn btn-lightning btn-sm py-1 px-2"
                                            style={{ fontSize: '11px', fontWeight: '600' }}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default PropertyMap;