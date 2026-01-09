import StatCard from "@/components/StatCard";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value="120" />
        <StatCard title="Active Sessions" value="45" />
        <StatCard title="QR Codes Used" value="300" />
      </div>
    </div>
  );
}
