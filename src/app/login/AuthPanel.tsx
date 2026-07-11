"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  getSupabaseBrowser,
  hasSupabaseBrowserEnv,
} from "@/lib/supabase-browser";

type AuthMode = "sign-in" | "sign-up";

export default function AuthPanel() {
  const isConfigured = hasSupabaseBrowserEnv();
  const supabase = useMemo(
    () => (isConfigured ? getSupabaseBrowser() : null),
    [isConfigured],
  );
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!supabase) {
      setLoading(false);
      setError("Supabase login keys are not configured yet.");
      return;
    }

    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "sign-up") {
      setMode("sign-in");
      setPassword("");
      setMessage("Check your email and click the confirmation link, then sign in.");
      return;
    }

    setMessage("Signed in successfully.");
  }

  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <div>
          <p style={styles.eyebrow}>AI Product Buzz Feed</p>
          <h1 style={styles.title}>
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </h1>
          <p style={styles.copy}>
            Access the dashboard that tracks AI product launches and buzz.
          </p>
        </div>

        <div style={styles.switcher} aria-label="Authentication mode">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            style={mode === "sign-in" ? styles.activeTab : styles.tab}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            style={mode === "sign-up" ? styles.activeTab : styles.tab}
          >
            Sign up
          </button>
        </div>

        {!isConfigured && (
          <p style={styles.error}>
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
            .env.local to enable login.
          </p>
        )}

        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              style={styles.input}
              type="email"
              value={email}
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={styles.input}
              type={showPassword ? "text" : "password"}
              value={password}
            />
          </label>
          <label style={styles.checkLabel}>
            <input
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
              style={styles.checkbox}
              type="checkbox"
            />
            Show password
          </label>

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}

          <button
            disabled={loading || !isConfigured}
            style={{
              ...styles.submit,
              opacity: loading || !isConfigured ? 0.65 : 1,
            }}
            type="submit"
          >
            {loading
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

const styles = {
  page: {
    alignItems: "center",
    background: "#f5f7fb",
    color: "#172033",
    display: "flex",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 24,
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #d9e1ec",
    borderRadius: 8,
    boxShadow: "0 18px 50px rgba(28, 45, 74, 0.12)",
    display: "grid",
    gap: 24,
    maxWidth: 420,
    padding: 28,
    width: "100%",
  },
  eyebrow: {
    color: "#426b9f",
    fontSize: 13,
    fontWeight: 700,
    margin: "0 0 8px",
  },
  title: {
    fontSize: 30,
    lineHeight: 1.1,
    margin: "0 0 10px",
  },
  copy: {
    color: "#5c6b7f",
    lineHeight: 1.5,
    margin: 0,
  },
  switcher: {
    background: "#eef3f8",
    borderRadius: 6,
    display: "grid",
    gap: 4,
    gridTemplateColumns: "1fr 1fr",
    padding: 4,
  },
  tab: {
    background: "transparent",
    border: 0,
    borderRadius: 5,
    color: "#4b5e75",
    cursor: "pointer",
    fontWeight: 700,
    padding: "10px 12px",
  },
  activeTab: {
    background: "#ffffff",
    border: 0,
    borderRadius: 5,
    boxShadow: "0 1px 4px rgba(22, 34, 51, 0.12)",
    color: "#172033",
    cursor: "pointer",
    fontWeight: 700,
    padding: "10px 12px",
  },
  form: {
    display: "grid",
    gap: 16,
  },
  label: {
    color: "#26364a",
    display: "grid",
    fontSize: 14,
    fontWeight: 700,
    gap: 8,
  },
  input: {
    border: "1px solid #c8d3df",
    borderRadius: 6,
    font: "inherit",
    padding: "12px 14px",
  },
  checkLabel: {
    alignItems: "center",
    color: "#4b5e75",
    cursor: "pointer",
    display: "flex",
    fontSize: 14,
    fontWeight: 700,
    gap: 8,
    marginTop: -6,
  },
  checkbox: {
    accentColor: "#172033",
    height: 16,
    width: 16,
  },
  error: {
    background: "#fff0f0",
    border: "1px solid #f0b8b8",
    borderRadius: 6,
    color: "#9b1c1c",
    margin: 0,
    padding: 12,
  },
  success: {
    background: "#eefaf1",
    border: "1px solid #b8e2c3",
    borderRadius: 6,
    color: "#176b35",
    margin: 0,
    padding: 12,
  },
  submit: {
    background: "#172033",
    border: 0,
    borderRadius: 6,
    color: "#ffffff",
    cursor: "pointer",
    font: "inherit",
    fontWeight: 800,
    padding: "13px 16px",
  },
} satisfies Record<string, React.CSSProperties>;
