"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import styles from "../page.module.css";

type Counts = { profiles: number; user_settings: number; user_websites: number; website_catalog: number };
type CatalogIssue = { id: string; name: string | null; url: string | null };

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [issues, setIssues] = useState<CatalogIssue[]>([]);
  const [ping, setPing] = useState<string>("Checking...");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { error: pingErr } = await supabase.from("profiles").select("id", { count: "exact", head: true }).limit(1);
        setPing(pingErr ? `Fail: ${pingErr.message}` : "OK");
        const [p, s, w, c] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("user_settings").select("*", { count: "exact", head: true }),
          supabase.from("user_websites").select("*", { count: "exact", head: true }),
          supabase.from("website_catalog").select("*", { count: "exact", head: true }),
        ]);
        setCounts({
          profiles: p.count ?? 0,
          user_settings: s.count ?? 0,
          user_websites: w.count ?? 0,
          website_catalog: c.count ?? 0,
        });
        const { data: missing } = await supabase
          .from("website_catalog")
          .select("id, name, url")
          .or("url.is.null,url.eq.")
          .order("name");
        setIssues((missing as CatalogIssue[]) ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load diagnostics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Admin Dashboard</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3>Health</h3>
            <p>Supabase: {ping}</p>
          </div>
          <div className={styles.card}>
            <h3>Profiles</h3>
            <p>{counts ? counts.profiles : "…"}</p>
          </div>
          <div className={styles.card}>
            <h3>User Settings</h3>
            <p>{counts ? counts.user_settings : "…"}</p>
          </div>
          <div className={styles.card}>
            <h3>User Websites</h3>
            <p>{counts ? counts.user_websites : "…"}</p>
          </div>
          <div className={styles.card}>
            <h3>Catalog</h3>
            <p>{counts ? counts.website_catalog : "…"}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.headerRow}>
            <h3>Quick Links</h3>
            <div className={styles.actionGroup}>
              <Link href="/admin/users" className={styles.linkButton}>Users</Link>
              <Link href="/admin/websites" className={styles.linkButton}>Website Catalog</Link>
              <Link href="/admin/announcements" className={styles.linkButton}>Announcements</Link>
            </div>
          </div>
          {loading && <p>Loading…</p>}
        </div>

        <div className={styles.card}>
          <h3>Catalog validation</h3>
          {issues.length === 0 ? (
            <p>All catalog entries have URLs.</p>
          ) : (
            <>
              <p>Missing URLs: {issues.length}</p>
              <div className={styles.listCard}>
                <div className={styles.listHeader}>
                  <span>ID</span>
                  <span>Name</span>
                  <span>URL</span>
                  <span></span>
                </div>
                {issues.map((i) => (
                  <div key={i.id} className={styles.listRow}>
                    <span>{i.id}</span>
                    <span>{i.name ?? "—"}</span>
                    <span>{i.url ?? "—"}</span>
                    <span className={styles.actionGroup}>
                      <Link href="/admin/websites" className={styles.linkButton}>Fix</Link>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
