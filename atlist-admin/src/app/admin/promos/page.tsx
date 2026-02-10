"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import styles from "../../page.module.css";

type Promo = { id: string; code: string; percent_off: number | null; stripe_promo_code_id: string | null; active: boolean | null; expires_at: string | null };

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [form, setForm] = useState<Partial<Promo>>({ code: "", percent_off: null, stripe_promo_code_id: "", active: true, expires_at: null });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setPromos(data as Promo[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.code) {
      setError("Code required");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      code: form.code,
      percent_off: form.percent_off,
      stripe_promo_code_id: form.stripe_promo_code_id || null,
      active: form.active ?? true,
      expires_at: form.expires_at || null,
    };
    const { error } = editingId
      ? await supabase.from("promo_codes").update(payload).eq("id", editingId)
      : await supabase.from("promo_codes").insert(payload);
    if (error) setError(error.message);
    else {
      setEditingId(null);
      setForm({ code: "", percent_off: null, stripe_promo_code_id: "", active: true, expires_at: null });
      load();
    }
    setSaving(false);
  };

  const edit = (p: Promo) => {
    setEditingId(p.id);
    setForm(p);
  };

  const del = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) setError(error.message);
    else load();
    setSaving(false);
  };

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Promotions</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.card}>
          <h3>{editingId ? "Edit Promo" : "Add Promo"}</h3>
          <div className={styles.formRow}>
            <label>Code</label>
            <input className={styles.input} value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div className={styles.formRow}>
            <label>Percent Off</label>
            <input
              className={styles.input}
              value={form.percent_off ?? ""}
              onChange={(e) => setForm({ ...form, percent_off: e.target.value ? Number(e.target.value) : null })}
              type="number"
            />
          </div>
          <div className={styles.formRow}>
            <label>Stripe Promo Code ID (promotion_code_xxx)</label>
            <input
              className={styles.input}
              value={form.stripe_promo_code_id ?? ""}
              onChange={(e) => setForm({ ...form, stripe_promo_code_id: e.target.value })}
            />
          </div>
          <div className={styles.formRow}>
            <label>Expires At (optional)</label>
            <input
              className={styles.input}
              value={form.expires_at ?? ""}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              placeholder="2026-12-31T00:00:00Z"
            />
          </div>
          <div className={styles.formRow}>
            <label>Active</label>
            <input
              type="checkbox"
              checked={form.active ?? true}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
          </div>
          <button className={styles.button} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          {editingId && <button className={styles.buttonSecondary} onClick={() => { setEditingId(null); setForm({ code: "", percent_off: null, stripe_promo_code_id: "", active: true, expires_at: null }); }}>Cancel</button>}
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>Code</span>
            <span>Percent</span>
            <span>Stripe Promo ID</span>
            <span>Active</span>
            <span>Expires</span>
            <span>Actions</span>
          </div>
          {loading && <div className={styles.listRow}><span>Loading…</span></div>}
          {!loading && promos.map((p) => (
            <div key={p.id} className={styles.listRow}>
              <span>{p.code}</span>
              <span>{p.percent_off ?? "—"}</span>
              <span>{p.stripe_promo_code_id ?? "—"}</span>
              <span>{p.active ? "Yes" : "No"}</span>
              <span>{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}</span>
              <span className={styles.actionGroup}>
                <button className={styles.linkButton} onClick={() => edit(p)}>Edit</button>
                <button className={styles.linkButtonDanger} onClick={() => del(p.id)}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
