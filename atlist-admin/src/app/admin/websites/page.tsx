"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import styles from "../../page.module.css";

type Catalog = { id: string; name: string; category: string | null; url: string };

const emptyForm: Catalog = { id: "", name: "", category: "", url: "" };

export default function WebsitesPage() {
  const [rows, setRows] = useState<Catalog[]>([]);
  const [form, setForm] = useState<Catalog>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("website_catalog").select("*").order("name");
    if (error) setError(error.message);
    else setRows(data as Catalog[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    if (!form.id || !form.name || !form.url) {
      setError("id, name, and url are required");
      setSaving(false);
      return;
    }
    if (editingId && editingId !== form.id) {
      setError("Cannot change id; delete and re-add instead.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("website_catalog").upsert(form);
    if (error) setError(error.message);
    else {
      setForm(emptyForm);
      setEditingId(null);
      load();
    }
    setSaving(false);
  };

  const handleEdit = (row: Catalog) => {
    setEditingId(row.id);
    setForm(row);
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("website_catalog").delete().eq("id", id);
    if (error) setError(error.message);
    else load();
    setSaving(false);
  };

  if (loading) return <main className={styles.main}><p>Loading catalog…</p></main>;

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Website Catalog</h2>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.card}>
          <h3>{editingId ? `Edit ${editingId}` : "Add Website"}</h3>
          <div className={styles.formRow}>
            <label>ID</label>
            <input className={styles.input} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
          </div>
          <div className={styles.formRow}>
            <label>Name</label>
            <input className={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className={styles.formRow}>
            <label>Category</label>
            <input className={styles.input} value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className={styles.formRow}>
            <label>URL</label>
            <input className={styles.input} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
          <button className={styles.button} onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          {editingId && (
            <button className={styles.buttonSecondary} onClick={() => { setForm(emptyForm); setEditingId(null); }}>
              Cancel edit
            </button>
          )}
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>ID</span>
            <span>Name</span>
            <span>Category</span>
            <span>URL</span>
            <span>Actions</span>
          </div>
          {rows.map((r) => (
            <div key={r.id} className={styles.listRow}>
              <span>{r.id}</span>
              <span>{r.name}</span>
              <span>{r.category ?? "—"}</span>
              <span>{r.url}</span>
              <span className={styles.actionGroup}>
                <button className={styles.linkButton} onClick={() => handleEdit(r)}>Edit</button>
                <button className={styles.linkButtonDanger} onClick={() => handleDelete(r.id)}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
