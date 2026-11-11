export type ReportStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "assigned"
  | "in_progress"
  | "completed";

export type ReportCategory =
  | "jalan"
  | "bersih"
  | "drain"
  | "lampu"
  | "ling";

export interface Report {
  id: string;
  report_code: string | null;
  title: string;
  description: string | null;
  category: string;
  incident_date: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  created_at: string;

  photo_urls?: string[];
}