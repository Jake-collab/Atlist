"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import styles from "../../../page.module.css";

type Message = { id: string; sender_type: string; body: string; created_at: string };
type Ticket = { id: string; category: string; subject: string | null; email: string | null; status: string | null };

export default function BugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params?.id as string | undefined;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!ticketId) return;
      setLoading(true);
      setError(null);
      const [{ data: tData, error: tErr }, { data: mData, error: mErr }] = await Promise.all([
        supabase.from("support_tickets").select("id, category, subject, email, status").eq("id", ticketId).single(),
        supabase.from("support_messages").select("id, sender_type, body, created_at").eq("ticket_id", ticketId).order("created_at", { ascending: true }),
      ]);
      if (tErr) setError(tErr.message);
      else setTicket(tData as Ticket);
      if (mErr) setError(mErr.message);
      else setMessages(mData as Message[]);
      setLoading(false);
    };
    load();
  }, [ticketId]);

  const sendReply = async () => {
    if (!reply.trim() || !ticketId) return;
    setSending(true);
    setError(null);
    const { error } = await supabase.functions.invoke("reply-ticket", {
      body: { ticket_id: ticketId, body: reply.trim() },
    });
    if (error) setError(error.message);
    else {
      setReply("");
      const { data: mData } = await supabase
        .from("support_messages")
        .select("id, sender_type, body, created_at")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      if (mData) setMessages(mData as Message[]);
    }
    setSending(false);
  };

  if (loading) return <main className={styles.main}><p>Loading ticket…</p></main>;
  if (error) return <main className={styles.main}><p className={styles.error}>{error}</p></main>;
  if (!ticket) return <main className={styles.main}><p>Not found</p></main>;

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <div className={styles.headerRow}>
          <button className={styles.linkButton} onClick={() => router.back()}>← Back</button>
          <h2>Bug Ticket</h2>
          <span />
        </div>
        <div className={styles.card}>
          <p><strong>Category:</strong> {ticket.category}</p>
          <p><strong>Subject:</strong> {ticket.subject ?? "(none)"}</p>
          <p><strong>Email:</strong> {ticket.email ?? "—"}</p>
          <p><strong>Status:</strong> {ticket.status ?? "open"}</p>
        </div>
        <div className={styles.card}>
          <h3>Messages</h3>
          <div className={styles.messageList}>
            {messages.map((m) => (
              <div key={m.id} className={styles.messageRow}>
                <span className={styles.messageMeta}>{m.sender_type}</span>
                <span>{m.body}</span>
                <span className={styles.messageMeta}>{new Date(m.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <textarea
            className={styles.textarea}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply"
          />
          <div className={styles.actionGroup}>
            <button className={styles.button} onClick={sendReply} disabled={sending}>
              {sending ? "Sending…" : "Send reply"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
