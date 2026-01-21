"use client";

import React from "react";
import styles from "../../page.module.css";

export default function RevenuePage() {
  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Revenue (stub)</h2>
        <div className={styles.card}>
          <p>TODO: Add revenue stats fed by Stripe (server-side) or cached in Supabase.</p>
          <p>Suggestion: call a secured Edge Function that queries Stripe balances/charges and return summary by period.</p>
        </div>
      </div>
    </main>
  );
}
