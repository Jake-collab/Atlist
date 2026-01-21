"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import styles from "../../page.module.css";

type PingResult = { ok: boolean; message: string };
type PolicyCheck = { table: string; rls: boolean };

export default function DiagnosticsPage() {
  const [ping, setPing] = useState<PingResult>({ ok: true, message: "Checking…" });
  const [rls, setRls] = useState<PolicyCheck[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // basic ping
        const { error: pingErr } = await supabase.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
        setPing(pingErr ? { ok: false, message: pingErr.message } : { ok: true, message: "OK" });

        // check RLS on key tables (client cannot see real policy details; we infer enablement)
        const tables = ["profiles", "user_settings", "user_websites", "website_catalog", "announcements"];
        const checks: PolicyCheck[] = [];
        for (const t of tables) {
          // Attempt a head select; if RLS blocks, we may get an error here.
          const { error: rlsErr } = await supabase.from(t).select("id", { head: true }).limit(1);
          checks.push({ table: t, rls: !rlsErr || rlsErr.code !== "PGRST302" ? true : false });
        }
        setRls(checks);
      } catch (e: any) {
        setError(e?.message ?? "Failed to run diagnostics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Diagnostics</h2>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3>Supabase Ping</h3>
            <p style={{ color: ping.ok ? "#0f172a" : "#b91c1c" }}>{ping.message}</p>
          </div>
        </div>

        <div className={styles.card}>
          <h3>RLS check (inferred)</h3>
          <div className={styles.listCard}>
            <div className={styles.listHeader}>
              <span>Table</span>
              <span>Status</span>
            </div>
            {loading && <div className={styles.listRow}><span>Loading…</span><span></span></div>}
            {!loading && rls.map((c) => (
              <div key={c.table} className={styles.listRow}>
                <span>{c.table}</span>
                <span>{c.rls ? "OK/Enabled" : "Check RLS"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
