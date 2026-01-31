
'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in Leaflet + Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

const RedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

export interface MapPoint {
    id: string;
    lat: number;
    lng: number;
    name: string;
    isHighRisk: boolean;
    description?: string;
}

interface FraudMapProps {
    points: MapPoint[];
}

export default function FraudMap({ points }: FraudMapProps) {
    useEffect(() => {
        // Client-side only fix
        (async () => {
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Marker.prototype.options.icon = DefaultIcon;
        })();
    }, []);

    if (points.length === 0) {
        return <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center text-gray-500">No GPS data available</div>;
    }

    // Calculate center approx
    const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const centerLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;

    return (
        <MapContainer center={[centerLat, centerLng]} zoom={10} scrollWheelZoom={false} style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((point) => (
                <Marker
                    key={point.id}
                    position={[point.lat, point.lng]}
                    icon={point.isHighRisk ? RedIcon : DefaultIcon}
                >
                    <Popup>
                        <div className="p-1">
                            <h3 className="font-bold">{point.name}</h3>
                            <p className="text-sm">{point.description}</p>
                            {point.isHighRisk && <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">High Risk</span>}
                        </div>
                    </Popup>
                    {point.isHighRisk && (
                        <Circle
                            center={[point.lat, point.lng]}
                            radius={500}
                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
                        />
                    )}
                </Marker>
            ))}
        </MapContainer>
    );
}
