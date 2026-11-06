"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapPin,
  LocateFixed,
  LoaderCircle,
  Navigation,
  Info,
  CheckCircle2,
} from "lucide-react";

import type { LocationValue } from "./LocationPicker";

interface LocationMapProps {
  value: LocationValue | null;
  onChange: (location: LocationValue) => void;
}

export default function LocationMap({ value, onChange }: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [locating, setLocating] = useState(false);
  const [status, setStatus] = useState("Pilih lokasi laporan pada peta.");

  const defaultCenter: L.LatLngExpression = [-7.9666, 112.6326];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView(defaultCenter, 12);

    mapRef.current = map;

    // Hilangkan tulisan "Leaflet" dari watermark
    map.attributionControl.setPrefix(false);

    // Tampilkan peta OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    }).addTo(map);

    // Kontrol zoom di kanan bawah
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    const markerIcon = L.divIcon({
      className: "",
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background: #059669;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 10px rgba(0,0,0,.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 9px;
            height: 9px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    const updatePosition = (latlng: L.LatLngExpression) => {
      const point = L.latLng(latlng);

      if (!markerRef.current) {
        markerRef.current = L.marker(point, {
          icon: markerIcon,
          draggable: true,
          autoPan: true,
        }).addTo(map);

        markerRef.current.on("dragend", () => {
          const newPosition = markerRef.current!.getLatLng();

          onChange({
            lat: newPosition.lat,
            lng: newPosition.lng,
          });

          setStatus("Lokasi berhasil diperbarui.");
        });
      } else {
        markerRef.current.setLatLng(point);
      }

      onChange({
        lat: point.lat,
        lng: point.lng,
      });
    };

    map.on("click", (event: L.LeafletMouseEvent) => {
      updatePosition(event.latlng);
      setStatus("Lokasi dipilih melalui peta.");
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [onChange]);

  useEffect(() => {
    if (!mapRef.current || !value) return;

    const current = markerRef.current?.getLatLng();

    if (current && current.lat === value.lat && current.lng === value.lng) {
      return;
    }

    const point = L.latLng(value.lat, value.lng);

    if (!markerRef.current) {
      // Marker akan dibuat ketika map sudah siap.
      // Penempatan awal dilakukan melalui efek berikutnya.
      const map = mapRef.current;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:30px;height:30px;background:#059669;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.25)"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      markerRef.current = L.marker(point, {
        icon,
        draggable: true,
        autoPan: true,
      }).addTo(map);

      markerRef.current.on("dragend", () => {
        const p = markerRef.current!.getLatLng();
        onChange({ lat: p.lat, lng: p.lng });
      });
    } else {
      markerRef.current.setLatLng(point);
    }
  }, [value, onChange]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Browser tidak mendukung GPS.");
      return;
    }

    setLocating(true);
    setStatus("Sedang mengambil lokasi GPS...");

    navigator.geolocation.getCurrentPosition(
      (result) => {
        const lat = result.coords.latitude;
        const lng = result.coords.longitude;

        const map = mapRef.current;

        if (map) {
          const point = L.latLng(lat, lng);

          if (markerRef.current) {
            markerRef.current.setLatLng(point);
          } else {
            // Marker akan dibuat oleh efek value
          }

          onChange({ lat, lng });
          map.flyTo(point, 17, { duration: 1.2 });
        }

        setStatus("Lokasi GPS berhasil ditemukan.");
        setLocating(false);
      },
      (error) => {
        const messages: Record<number, string> = {
          1: "Izin lokasi ditolak.",
          2: "Lokasi tidak dapat ditemukan.",
          3: "Waktu pengambilan lokasi habis.",
        };

        setStatus(messages[error.code] ?? "Gagal mengambil lokasi.");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  return (
    <aside className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Lokasi Laporan</h2>
            <p className="mt-1 text-xs text-slate-500">
              Tentukan titik lokasi kejadian
            </p>
          </div>

          <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            Peta aktif
          </span>
        </div>

        <div className="relative m-3 overflow-hidden rounded-xl border border-slate-200">
          <div ref={mapContainerRef} className="z-0 h-[300px] w-full" />

          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={locating}
            className="absolute left-3 top-3 z-[1000] flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 disabled:opacity-60"
          >
            {locating ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <LocateFixed size={13} />
            )}

            {locating ? "Mencari lokasi..." : "Lokasi Saya"}
          </button>
        </div>

        <div className="space-y-4 px-5 pb-4">
          {value && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Latitude</p>
                <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-700">
                  {value.lat.toFixed(6)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Longitude</p>
                <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-700">
                  {value.lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
