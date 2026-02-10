"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import styles from "../../page.module.css";

export default function RevenuePage() {
  const [total, setTotal] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.functions.invoke("revenue-report", { method: "GET" });
      if (error) setError(error.message);
      else {
        setTotal((data as any)?.total_cents ?? null);
        setCount((data as any)?.count ?? null);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Revenue</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.card}>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <>
              <p><strong>Total charges:</strong> {total !== null ? `$${(total / 100).toFixed(2)}` : "—"}</p>
              <p><strong>Count:</strong> {count ?? "—"}</p>
              <p style={{ fontSize: 12, color: "#64748b" }}>Note: uses last 100 charges from Stripe.</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
