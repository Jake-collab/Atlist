"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import styles from "../../page.module.css";

type Ticket = {
  id: string;
  user_id: string | null;
  email: string | null;
  type: string | null;
  message: string | null;
  reply: string | null;
  created_at: string | null;
};

export default function SupportInboxPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/");
        return;
      }
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("type", "support")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setTickets(data as Ticket[]);
      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <div className={styles.headerRow}>
          <button className={styles.linkButton} onClick={() => router.back()}>Back</button>
          <h2>Support Inbox</h2>
          <span></span>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>Email</span>
            <span>Message</span>
            <span>Created</span>
            <span>Reply</span>
          </div>
          {loading && <div className={styles.listRow}><span>Loading…</span><span></span><span></span><span></span></div>}
          {!loading && tickets.length === 0 && <div className={styles.listRow}><span>No tickets</span><span></span><span></span><span></span></div>}
          {tickets.map((t) => (
            <div key={t.id} className={styles.listRow}>
              <span>{t.email ?? "—"}</span>
              <span>{t.message ?? "—"}</span>
              <span>{t.created_at ? new Date(t.created_at).toLocaleString() : "—"}</span>
              <span className={styles.actionGroup}>
                <Link className={styles.linkButton} href={`mailto:${t.email ?? ""}?subject=Support%20Response`}>Email</Link>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
