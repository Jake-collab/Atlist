"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import styles from "../../../page.module.css";

type Profile = { id: string; email: string | null; username: string | null; role: string | null; membership_active?: boolean | null; full_name?: string | null };
type Settings = { theme: string | null; notifications_enabled: boolean | null; preload_enabled: boolean | null; two_factor_enabled: boolean | null };
type UserWebsite = { website_id: string; position: number | null; custom_color: string | null; website_catalog?: { name: string | null; url: string | null } };

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string | undefined;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sites, setSites] = useState<UserWebsite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/");
        return;
      }
      try {
        const [{ data: pData, error: pErr }, { data: sData, error: sErr }, { data: wData, error: wErr }] = await Promise.all([
          supabase.from("profiles").select("id, email, username, role, membership_active, full_name").eq("id", userId).single(),
          supabase.from("user_settings").select("theme, notifications_enabled, preload_enabled, two_factor_enabled").eq("user_id", userId).single(),
          supabase
            .from("user_websites")
            .select("website_id, position, custom_color, website_catalog(name, url)")
            .eq("user_id", userId)
            .order("position", { ascending: true }),
        ]);
        if (pErr) throw pErr;
        setProfile(pData as Profile);
        if (!sErr && sData) setSettings(sData as Settings);
        if (!wErr && wData) setSites(wData as UserWebsite[]);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, router]);

  const clearUserData = async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      await supabase.from("user_settings").delete().eq("user_id", userId);
      await supabase.from("user_websites").delete().eq("user_id", userId);
      setSettings(null);
      setSites([]);
    } catch (e: any) {
      setError(e?.message ?? "Failed to clear data");
    } finally {
      setBusy(false);
    }
  };

  const toggleMembership = async () => {
    if (!userId || !profile) return;
    setBusy(true);
    setError(null);
    const next = !(profile.membership_active ?? false);
    const { error } = await supabase.from("profiles").update({ membership_active: next }).eq("id", userId);
    if (error) setError(error.message);
    else setProfile({ ...profile, membership_active: next });
    setBusy(false);
  };

  if (loading) return <main className={styles.main}><p>Loading user…</p></main>;
  if (error) return <main className={styles.main}><p className={styles.error}>{error}</p></main>;
  if (!profile) return <main className={styles.main}><p>User not found.</p></main>;

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>User Detail</h2>
        <div className={styles.card}>
          <p><strong>ID:</strong> {profile.id}</p>
          <p><strong>Email:</strong> {profile.email ?? "—"}</p>
          <p><strong>Username:</strong> {profile.username ?? "—"}</p>
          <p><strong>Name:</strong> {profile.full_name ?? "—"}</p>
          <p><strong>Role:</strong> {profile.role ?? "user"}</p>
          <p><strong>Membership:</strong> {profile.membership_active ? "Active" : "None"}</p>
          <div className={styles.actionGroup} style={{ marginTop: 12 }}>
            <button className={styles.linkButton} onClick={toggleMembership} disabled={busy}>
              {busy ? "Updating…" : profile.membership_active ? "Disable membership" : "Enable membership"}
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Settings</h3>
          {settings ? (
            <>
              <p><strong>Theme:</strong> {settings.theme ?? "—"}</p>
              <p><strong>Notifications:</strong> {settings.notifications_enabled ? "On" : "Off"}</p>
              <p><strong>Preload:</strong> {settings.preload_enabled ? "On" : "Off"}</p>
              <p><strong>2FA:</strong> {settings.two_factor_enabled ? "On" : "Off"}</p>
            </>
          ) : (
            <p>No settings row.</p>
          )}
          <div className={styles.actionGroup} style={{ marginTop: 12 }}>
            <button className={styles.linkButtonDanger} onClick={clearUserData} disabled={busy}>
              {busy ? "Clearing…" : "Clear user data (settings + websites)"}
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Websites</h3>
          {sites.length === 0 && <p>No websites.</p>}
          {sites.map((s) => (
            <div key={`${s.website_id}-${s.position}`} className={styles.listRow}>
              <span>{s.website_catalog?.name ?? s.website_id}</span>
              <span>{s.website_catalog?.url ?? "—"}</span>
              <span>Pos: {s.position ?? "—"}</span>
              <span>Color: {s.custom_color ?? "default"}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
