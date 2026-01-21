"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import styles from "../../page.module.css";

type Catalog = { id: string; name: string; category: string | null; url: string };

const emptyForm: Catalog = { id: "", name: "", category: "", url: "" };

const DEFAULT_CATALOG: Catalog[] = [
  // Shopping & Retail
  { id: "Amazon", name: "Amazon", category: "Shopping & Retail - General Retail", url: "https://www.amazon.com/" },
  { id: "Walmart", name: "Walmart", category: "Shopping & Retail - General Retail", url: "https://www.walmart.com/" },
  { id: "Target", name: "Target", category: "Shopping & Retail - General Retail", url: "https://www.target.com/" },
  { id: "Costco", name: "Costco", category: "Shopping & Retail - General Retail", url: "https://www.costco.com/" },
  { id: "Sam's Club", name: "Sam's Club", category: "Shopping & Retail - General Retail", url: "https://www.samsclub.com/" },
  { id: "BJ's", name: "BJ's", category: "Shopping & Retail - General Retail", url: "https://www.bjs.com/" },
  { id: "eBay", name: "eBay", category: "Shopping & Retail - General Retail", url: "https://www.ebay.com/" },
  { id: "Wayfair", name: "Wayfair", category: "Shopping & Retail - General Retail", url: "https://www.wayfair.com/" },
  { id: "Temu", name: "Temu", category: "Shopping & Retail - General Retail", url: "https://www.temu.com/" },
  { id: "Shein", name: "Shein", category: "Shopping & Retail - General Retail", url: "https://us.shein.com/" },
  { id: "Etsy", name: "Etsy", category: "Shopping & Retail - General Retail", url: "https://www.etsy.com/" },
  { id: "Groupon", name: "Groupon", category: "Shopping & Retail - General Retail", url: "https://www.groupon.com/" },
  { id: "OfferUp", name: "OfferUp", category: "Shopping & Retail - Marketplace", url: "https://offerup.com/" },
  { id: "Craigslist", name: "Craigslist", category: "Shopping & Retail - Marketplace", url: "https://www.craigslist.org/" },
  // Food & Grocery Delivery
  { id: "DoorDash", name: "DoorDash", category: "Food Delivery", url: "https://www.doordash.com/" },
  { id: "Uber Eats", name: "Uber Eats", category: "Food Delivery", url: "https://www.ubereats.com/" },
  { id: "Grubhub", name: "Grubhub", category: "Food Delivery", url: "https://www.grubhub.com/" },
  { id: "Postmates", name: "Postmates", category: "Food Delivery", url: "https://postmates.com/" },
  { id: "Instacart", name: "Instacart", category: "Grocery Delivery", url: "https://www.instacart.com/" },
  { id: "Shipt", name: "Shipt", category: "Grocery Delivery", url: "https://www.shipt.com/" },
  // Local Services & Gig Work
  { id: "TaskRabbit", name: "TaskRabbit", category: "Local Task Services", url: "https://www.taskrabbit.com/" },
  { id: "Thumbtack", name: "Thumbtack", category: "Local Task Services", url: "https://www.thumbtack.com/" },
  { id: "Angie's List", name: "Angie's List", category: "Local Task Services", url: "https://www.angi.com/" },
  { id: "Wag", name: "Wag", category: "Pet Services", url: "https://wagwalking.com/" },
  { id: "Rover", name: "Rover", category: "Pet Services", url: "https://www.rover.com/" },
  { id: "Instawork", name: "Instawork", category: "Gig Labor / Instant Work", url: "https://www.instawork.com/" },
  // Housing & Real Estate
  { id: "Zillow", name: "Zillow", category: "Housing - Buy / Sell Homes", url: "https://www.zillow.com/" },
  { id: "Redfin", name: "Redfin", category: "Housing - Buy / Sell Homes", url: "https://www.redfin.com/" },
  { id: "Realtor", name: "Realtor", category: "Housing - Buy / Sell Homes", url: "https://www.realtor.com/" },
  { id: "HotPads", name: "HotPads", category: "Housing - Rentals", url: "https://hotpads.com/" },
  { id: "Apartments.com", name: "Apartments.com", category: "Housing - Rentals", url: "https://www.apartments.com/" },
  // Travel & Vacation
  { id: "Airbnb", name: "Airbnb", category: "Vacation Rentals", url: "https://www.airbnb.com/" },
  { id: "Vrbo", name: "Vrbo", category: "Vacation Rentals", url: "https://www.vrbo.com/" },
  { id: "Booking.com", name: "Booking.com", category: "Travel Booking", url: "https://www.booking.com/" },
  { id: "Hotels.com", name: "Hotels.com", category: "Travel Booking", url: "https://www.hotels.com/" },
  { id: "Kayak", name: "Kayak", category: "Travel Booking", url: "https://www.kayak.com/" },
  // Social Media & Communities
  { id: "Facebook", name: "Facebook", category: "Social Platforms", url: "https://www.facebook.com/" },
  { id: "X", name: "X", category: "Social Platforms", url: "https://x.com/" },
  { id: "Threads", name: "Threads", category: "Social Platforms", url: "https://www.threads.net/" },
  { id: "Tumblr", name: "Tumblr", category: "Social Platforms", url: "https://www.tumblr.com/" },
  { id: "LinkedIn", name: "LinkedIn", category: "Social Platforms", url: "https://www.linkedin.com/" },
  { id: "Reddit", name: "Reddit", category: "Social Platforms", url: "https://www.reddit.com/" },
  { id: "YouTube", name: "YouTube", category: "Video Platforms", url: "https://www.youtube.com/" },
  { id: "Twitch", name: "Twitch", category: "Video Platforms", url: "https://www.twitch.tv/" },
  // Job Search & Hiring
  { id: "Indeed", name: "Indeed", category: "Job Search & Hiring", url: "https://www.indeed.com/" },
  { id: "ZipRecruiter", name: "ZipRecruiter", category: "Job Search & Hiring", url: "https://www.ziprecruiter.com/" },
  { id: "Glassdoor", name: "Glassdoor", category: "Job Search & Hiring", url: "https://www.glassdoor.com/" },
  { id: "Snagajob", name: "Snagajob", category: "Job Search & Hiring", url: "https://www.snagajob.com/" },
  { id: "Monster", name: "Monster", category: "Job Search & Hiring", url: "https://www.monster.com/" },
  // Freelance
  { id: "Fiverr", name: "Fiverr", category: "Online Freelance Services", url: "https://www.fiverr.com/" },
  { id: "Upwork", name: "Upwork", category: "Online Freelance Services", url: "https://www.upwork.com/" },
];

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

  const importDefaults = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("website_catalog").upsert(DEFAULT_CATALOG, { onConflict: "id" });
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
          <div className={styles.listRow}>
            <span style={{ gridColumn: "1 / -1" }}>
              <button className={styles.linkButton} onClick={importDefaults} disabled={saving}>
                {saving ? "Importing…" : "Import default Atlist websites"}
              </button>
            </span>
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
