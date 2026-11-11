
"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { FiExternalLink } from "react-icons/fi";

import "leaflet/dist/leaflet.css";

type Props = {
  latitude: number;
  longitude: number;
  title: string;
};

const reportIcon = L.divIcon({
  className: "report-map-marker",
  html: `
    <div style="
      width:34px;
      height:34px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:#2563eb;
      border:3px solid white;
      box-shadow:0 3px 12px rgba(15,23,42,.3);
    ">
      <div style="
        width:9px;
        height:9px;
        border-radius:50%;
        background:white;
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32],
});

function MapResize() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

export default function PetaLaporan({
  latitude,
  longitude,
  title,
}: Props) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const googleMapsUrl =
    `https://www.google.com/maps?q=${latitude},${longitude}`;

  if (!mapReady) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-100">
        <p className="text-xs text-slate-500">Memuat peta...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={false}
        className="z-0 h-[280px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[latitude, longitude]}
          icon={reportIcon}
        >
          <Popup>{title}</Popup>
        </Marker>

        <MapResize />
      </MapContainer>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-2 bg-white px-4 py-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
      >
        <span>Lihat petunjuk lokasi di Google Maps</span>
        <FiExternalLink size={15} />
      </a>
    </div>
  );
}
