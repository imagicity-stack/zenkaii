"use client";

import { useStore } from "./Store";

export default function Toast() {
  const { toast } = useStore();
  return (
    <div aria-live="polite" role="status">
      {toast && (
        <div className="zk-toast">
          <span className="zk-toast-dot" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
