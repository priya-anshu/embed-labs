import { qrTokens } from "@/lib/mockData";

export default function QRPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">QR Codes</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-(--border) rounded-lg">
          <thead className="bg-(--muted) text-left">
            <tr>
              <th className="p-3 text-sm">Token</th>
              <th className="p-3 text-sm">Status</th>
              <th className="p-3 text-sm">User</th>
              <th className="p-3 text-sm">Created</th>
              <th className="p-3 text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {qrTokens.map((qr) => (
              <tr
                key={qr.id}
                className="border-t border-(--border)"
              >
                <td className="p-3 font-mono text-sm">{qr.token}</td>

                <td className="p-3">
                  {qr.is_used ? (
                    <span className="text-red-500 text-sm">Used</span>
                  ) : (
                    <span className="text-green-500 text-sm">Unused</span>
                  )}
                </td>

                <td className="p-3 text-sm">
                  {qr.user_email ?? "—"}
                </td>

                <td className="p-3 text-sm">{qr.created_at}</td>

                <td className="p-3">
                  <button className="text-sm text-(--primary) hover:underline">
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
