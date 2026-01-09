export default function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      className="bg-(--card) text-(--card-foreground)
                 border border-(--border)
                 rounded-lg p-4"
    >
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
