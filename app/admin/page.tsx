export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Quick overview of platform activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Total Kits" />
        <DashboardCard title="Active QRs" />
        <DashboardCard title="Audit Events" />
      </div>
    </div>
  );
}

function DashboardCard({ title }: { title: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-2 text-2xl font-bold">—</p>
    </div>
  );
}