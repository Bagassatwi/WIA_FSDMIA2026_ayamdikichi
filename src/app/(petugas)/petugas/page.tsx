import StatCards from "../components/StatsCard";
import RecentReports from "../components/RecentReport";

import {
  TrendChart,
  StatusChart,
  CategoryBreakdown,
} from "../components/ReportChart";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-[1700px] space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#102b59]">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Ringkasan laporan dan aktivitas penanganan masyarakat.
        </p>
      </div>

      {/* Statistics */}
      <StatCards />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <TrendChart />
        </div>

        <StatusChart />
        <CategoryBreakdown />
      </div>

      {/* Recent Reports */}
      <RecentReports />
    </div>
  );
}
