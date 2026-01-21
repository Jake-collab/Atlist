/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import styles from "./page.module.css";

type Profile = { id: string; email: string | null; username: string | null; role: string | null };

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [authing, setAuthing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const envMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, username, role")
        .eq("id", session.user.id)
        .limit(1);
      if (error) throw error;
      if (data && data.length) {
        const row = data[0];
        setProfile({
          id: row.id,
          email: row.email ?? session.user.email ?? null,
          username: row.username ?? null,
          role: row.role ?? "user",
        });
      } else {
        const fallbackEmail = session.user.email ?? "user@example.com";
        const fallbackUsername = fallbackEmail ? `@${fallbackEmail.split("@")[0]}` : "@user";
        await supabase.from("profiles").insert({
          id: session.user.id,
          email: fallbackEmail,
          username: fallbackUsername,
          role: "admin",
        });
        setProfile({
          id: session.user.id,
          email: fallbackEmail,
          username: fallbackUsername,
          role: "admin",
        });
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const { data: listener } = supabase.auth.onAuthStateChange(() => fetchProfile());
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setAuthing(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setAuthing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setEmail("");
    setPassword("");
  };

  const isAdmin = profile?.role === "admin";

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h1>Atlist Admin</h1>
        {envMissing && (
          <p className={styles.error}>Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local</p>
        )}
        {loading ? (
          <p>Loading session…</p>
        ) : profile ? (
          <>
            <p>Signed in as {profile.email ?? profile.username ?? profile.id}</p>
            <p>Role: {profile.role ?? "user"}</p>
            {!isAdmin && <p style={{ color: "crimson" }}>You are not an admin.</p>}
            {isAdmin && (
              <div className={styles.cardGrid}>
                <Link className={styles.card} href="/admin">
                  <h3>Dashboard →</h3>
                  <p>Health, counts, catalog validation.</p>
                </Link>
                <Link className={styles.card} href="/admin/users">
                  <h3>Users →</h3>
                  <p>Inspect profiles and their data.</p>
                </Link>
                <Link className={styles.card} href="/admin/websites">
                  <h3>Website Catalog →</h3>
                  <p>Manage master list of sites.</p>
                </Link>
                <Link className={styles.card} href="/admin/announcements">
                  <h3>Announcements →</h3>
                  <p>Post banners/updates to users.</p>
                </Link>
                <Link className={styles.card} href="/admin/promos">
                  <h3>Promos →</h3>
                  <p>Manage promo codes/discounts (stub).</p>
                </Link>
                <Link className={styles.card} href="/admin/revenue">
                  <h3>Revenue →</h3>
                  <p>Track membership revenue (stub).</p>
                </Link>
                <Link className={styles.card} href="/admin/diagnostics">
                  <h3>Diagnostics →</h3>
                  <p>Ping + RLS checks.</p>
                </Link>
                <Link className={styles.card} href="/admin/support">
                  <h3>Support Inbox →</h3>
                  <p>View support tickets.</p>
                </Link>
                <Link className={styles.card} href="/admin/bugs">
                  <h3>Bug Inbox →</h3>
                  <p>View bug reports.</p>
                </Link>
              </div>
            )}
            <button className={styles.button} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <div className={styles.formCard}>
            <h3>Login</h3>
            <input
              className={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
            <button className={styles.button} onClick={handleLogin} disabled={authing}>
              {authing ? "Signing in…" : "Sign In"}
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
