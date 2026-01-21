"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import styles from "../../page.module.css";

type Profile = { id: string; email: string | null; username: string | null; full_name?: string | null; role: string | null; membership_active?: boolean | null; created_at: string | null };

export default function UsersPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
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
        .from("profiles")
        .select("id, email, username, full_name, role, membership_active, created_at")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setProfiles(data as Profile[]);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) return <main className={styles.main}><p>Loading users…</p></main>;
  if (error) return <main className={styles.main}><p className={styles.error}>{error}</p></main>;

  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Users</h2>
        <div className={styles.listCard}>
          <div className={styles.listHeaderUsers}>
            <span>Email</span>
            <span>Username</span>
            <span>Name</span>
            <span>Role</span>
            <span>Membership</span>
            <span>Created</span>
          </div>
          {profiles.map((p) => (
            <Link key={p.id} href={`/admin/users/${p.id}`} className={styles.listRowUsers}>
              <span>{p.email ?? "—"}</span>
              <span>{p.username ?? "—"}</span>
              <span>{p.full_name ?? "—"}</span>
              <span>{p.role ?? "user"}</span>
              <span>{p.membership_active ? "Active" : "None"}</span>
              <span>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
