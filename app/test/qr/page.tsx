/**
 * Minimal local test UI for QR binding and verification.
 * No styling, no abstractions. Intended for manual verification only.
 * Uses existing server actions: bindQRAction, verifyQRAction.
 */

"use client";

import { useState, useTransition } from "react";
import { bindQRAction, verifyQRAction } from "@/features/qr/actions";

export default function QRTestPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleBind = () => {
    startTransition(async () => {
      const res = await bindQRAction(code);
      if (res.success) {
        setResult("Bind: success");
      } else {
        setResult(`Bind: ${res.error ?? "unknown error"}`);
      }
    });
  };

  const handleVerify = () => {
    startTransition(async () => {
      const res = await verifyQRAction(code);
      if (res.error) {
        setResult(`Verify: ${res.error}`);
        return;
      }
      const owner = res.belongsToUser ? "you" : "another user";
      setResult(`Verify: bound=${res.isBound} owner=${owner}`);
    });
  };

  return (
    <main>
      <h1>QR Test (local only)</h1>
      <label>
        QR Code (UUID v4):
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="QR code"
        />
      </label>
      <div>
        <button onClick={handleBind} disabled={isPending}>
          Bind
        </button>
        <button onClick={handleVerify} disabled={isPending}>
          Verify
        </button>
      </div>
      <div>
        <p>Pending: {isPending ? "yes" : "no"}</p>
        <p>Result: {result ?? "-"}</p>
      </div>
    </main>
  );
}
