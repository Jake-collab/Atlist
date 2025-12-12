"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import styles from "../../page.module.css";

type Announcement = { id: string; title: string; body: string; created_at: string };

const emptyForm = { title: "", body: "" };

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setItems(data as Announcement[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.body) {
      setError("Title and body are required");
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("announcements").insert(form);
    if (error) setError(error.message);
    else {
      setForm(emptyForm);
      load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) setError(error.message);
    else load();
    setSaving(false);
  };

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Announcements</h2>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.card}>
          <h3>Create</h3>
          <div className={styles.formRow}>
            <label>Title</label>
            <input className={styles.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className={styles.formRow}>
            <label>Body</label>
            <textarea
              className={styles.textarea}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={4}
            />
          </div>
          <button className={styles.button} onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>Title</span>
            <span>Created</span>
            <span>Actions</span>
          </div>
          {loading && <div className={styles.listRow}><span>Loading…</span><span></span><span></span></div>}
          {!loading && items.length === 0 && <div className={styles.listRow}><span>No announcements</span><span></span><span></span></div>}
          {items.map((a) => (
            <div key={a.id} className={styles.listRow}>
              <span>{a.title}</span>
              <span>{new Date(a.created_at).toLocaleString()}</span>
              <span className={styles.actionGroup}>
                <button className={styles.linkButtonDanger} onClick={() => handleDelete(a.id)}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
