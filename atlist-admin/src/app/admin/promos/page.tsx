"use client";

import React from "react";
import styles from "../../page.module.css";

export default function PromosPage() {
  return (
    <main className={styles.main}>
      <div className={styles.centerColumn}>
        <h2>Promotions (stub)</h2>
        <div className={styles.card}>
          <p>TODO: Add promo codes / discounts management.</p>
          <p>Suggestion: create a table promotions {`{id, code, percent_off, active, expires_at}`} and use it in the checkout Edge function.</p>
        </div>
      </div>
    </main>
  );
}
