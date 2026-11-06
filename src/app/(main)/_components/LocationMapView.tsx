
"use client";

import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

type UserLocation = {
  lat: number;
  lng: number;
};

type Props = {
  location: UserLocation | null;
  accuracy?: number;
};

const defaultCenter: [number, number] = [-7.9666, 112.6326];

function MapController({
  location,
}: {
  location: UserLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(
        [location.lat, location.lng],
        17,
        { duration: 1.5 }
      );
    }
  }, [location, map]);

  return null;
}

export default function LocationMapView({
  location,
  accuracy = 30,
}: Props) {
  const center: [number, number] = location
    ? [location.lat, location.lng]
    : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={location ? 17 : 11}
      scrollWheelZoom={true}
      zoomControl={true}
      className="h-full min-h-[300px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <MapController location={location} />

      {location && (
        <>
          {/* GPS Accuracy Radius */}
          <Circle
            center={center}
            radius={accuracy}
            pathOptions={{
              color: "#2563eb",
              weight: 1.5,
              fillColor: "#3b82f6",
              fillOpacity: 0.12,
            }}
          />

          {/* User Location */}
          <CircleMarker
            center={center}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#2563eb",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="font-semibold">
                Lokasi Anda saat ini
              </div>
            </Popup>
          </CircleMarker>
        </>
      )}
    </MapContainer>
  );
}
