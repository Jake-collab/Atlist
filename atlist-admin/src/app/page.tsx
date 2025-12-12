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

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, username, role")
      .eq("id", session.user.id)
      .single();
    if (error) {
      setError(error.message);
      setProfile(null);
    } else {
      setProfile({
        id: data.id,
        email: data.email ?? null,
        username: data.username ?? null,
        role: data.role ?? "user",
      });
    }
    setLoading(false);
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
        {loading ? (
          <p>Loading session…</p>
        ) : profile ? (
          <>
            <p>Signed in as {profile.email ?? profile.username ?? profile.id}</p>
            <p>Role: {profile.role ?? "user"}</p>
            {!isAdmin && <p style={{ color: "crimson" }}>You are not an admin.</p>}
            {isAdmin && (
              <div className={styles.cardGrid}>
                <Link className={styles.card} href="/admin/users">
                  <h3>Users →</h3>
                  <p>Inspect profiles and their data.</p>
                </Link>
                <Link className={styles.card} href="/admin/websites">
                  <h3>Website Catalog →</h3>
                  <p>Manage master list of sites.</p>
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
