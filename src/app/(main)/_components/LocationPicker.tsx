"use client";

import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";

export interface LocationValue {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: LocationValue | null;
  onChange: (location: LocationValue) => void;
}

const LocationMap = dynamic(
  () => import("./LocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[340px] items-center justify-center rounded-xl bg-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={18} className="animate-spin" />
          Memuat peta...
        </div>
      </div>
    ),
  }
);

export default function LocationPicker({
  value,
  onChange,
}: LocationPickerProps) {
  return (
    <LocationMap
      value={value}
      onChange={onChange}
    />
  );
}