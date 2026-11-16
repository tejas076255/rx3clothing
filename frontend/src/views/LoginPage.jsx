import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500";

export default function LoginPage() {
  const { login } = useAuth();
  const { setView, goShop } = useStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      goShop("All");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 animate-fade-up">
        <h1 className="font-display text-3xl font-bold">Welcome back</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Log in to track your orders and check out faster.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5">Email</label>
            <input
              className={inputCls}
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5">Password</label>
            <input
              className={inputCls}
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm font-medium text-ink bg-neutral-100 rounded-xl px-4 py-2.5">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-ink text-white font-semibold py-3.5 rounded-full hover:bg-brand-700 transition disabled:opacity-60"
          >
            {busy ? "Logging in…" : "Log In"}
          </button>
        </form>
        <p className="text-sm text-neutral-500 text-center mt-5">
          New to RX3?{" "}
          <button onClick={() => setView("signup")} className="font-semibold text-ink underline underline-offset-4">
            Create an account
          </button>
        </p>
        <p className="text-sm text-neutral-500 text-center mt-2">
          Store owner?{" "}
          <button onClick={() => setView("admin")} className="font-semibold text-ink underline underline-offset-4">
            Open the admin dashboard
          </button>
        </p>
      </div>
    </main>
  );
}
