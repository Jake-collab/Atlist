"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import styles from "../../page.module.css";

type Ticket = { id: string; category: string; subject: string | null; email: string | null; created_at: string; status: string | null };

export default function SupportQueuePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, category, subject, email, created_at, status")
        .eq("category", "support")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setTickets(data as Ticket[]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <main className={styles.main}><p>Loading support tickets…</p></main>;
  if (error) return <main className={styles.main}><p className={styles.error}>{error}</p></main>;

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Support Tickets</h2>
        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>Subject</span>
            <span>Email</span>
            <span>Created</span>
            <span>Status</span>
          </div>
          {tickets.map((t) => (
            <Link key={t.id} href={`/admin/support/${t.id}`} className={styles.listRow}>
              <span>{t.subject ?? "(no subject)"}</span>
              <span>{t.email ?? "—"}</span>
              <span>{new Date(t.created_at).toLocaleString()}</span>
              <span>{t.status ?? "open"}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
