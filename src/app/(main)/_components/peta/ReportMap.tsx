"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { LuExternalLink } from "react-icons/lu";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";

import type { Report } from "@/types/report";

// Warna marker berdasarkan status
const statusColors: Record<string, string> = {
  pending: "#D97706",
  verified: "#059669",
  rejected: "#DC2626",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

// Membuat icon marker Leaflet
function createStatusIcon(status: string) {
  const color = statusColors[status] ?? "#64748B";

  return L.divIcon({
    className: "report-marker",
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 7px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Otomatis mengatur posisi dan zoom peta
function MapAutoFit({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    const validReports = reports.filter(
      (report) =>
        Number.isFinite(report.latitude) && Number.isFinite(report.longitude),
    );

    if (validReports.length === 0) return;

    if (validReports.length === 1) {
      map.setView([validReports[0].latitude, validReports[0].longitude], 15);
      return;
    }

    const bounds = L.latLngBounds(
      validReports.map((report) => [report.latitude, report.longitude]),
    );

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [reports, map]);

  return null;
}

interface ReportMapProps {
  reports: Report[];
  onSelectReport?: (report: Report) => void;
}

export default function ReportMap({ reports, onSelectReport }: ReportMapProps) {
  const defaultCenter: [number, number] = [-7.8, 112.7];

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        scrollWheelZoom
        className="z-0 h-[520px] w-full"
      >
        <MapResize />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoFit reports={reports} />

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createStatusIcon(report.status)}
            eventHandlers={{
              click: () => onSelectReport?.(report),
            }}
          >
            <Popup>
              <div className="min-w-[190px] space-y-2">
                <div className="text-xs font-semibold text-slate-500">
                  {report.report_code ?? "Laporan JEJAKPUBLIK"}
                </div>

                <h3 className="font-semibold text-slate-900">{report.title}</h3>

                <div className="text-xs text-slate-500">{report.category}</div>

                <div
                  style={{ color: statusColors[report.status] }}
                  className="text-xs font-semibold"
                >
                  {statusLabels[report.status] ?? report.status}
                </div>

                <div className="text-xs text-slate-600">
                  {[report.district, report.city].filter(Boolean).join(", ")}
                </div>

                <Link
                  href={`/laporan/${report.report_code ?? report.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                >
                  Lihat detail laporan
                  <LuExternalLink size={14} />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function MapResize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    // Hitung ulang ukuran peta setelah layout selesai
    const refreshMap = () => {
      map.invalidateSize({
        animate: false,
        pan: false,
      });
    };

    const frame = requestAnimationFrame(refreshMap);

    // Pantau perubahan ukuran container
    const observer = new ResizeObserver(() => {
      refreshMap();
    });

    observer.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map]);

  return null;
}
