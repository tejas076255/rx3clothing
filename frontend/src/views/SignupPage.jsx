import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500";

export default function SignupPage() {
  const { signup } = useAuth();
  const { setView, goShop } = useStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      goShop("All");
    } catch (err) {
      setError(err.message || "Could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 animate-fade-up">
        <h1 className="font-display text-3xl font-bold">Create your account</h1>
        <p className="text-neutral-500 text-sm mt-1">
          One account for faster checkout and order tracking.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5">Full name</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Aarav Patel"
              autoComplete="name"
            />
          </div>
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm font-medium text-ink bg-neutral-100 rounded-xl px-4 py-2.5">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-ink text-white font-semibold py-3.5 rounded-full hover:bg-brand-700 transition disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Sign Up"}
          </button>
        </form>
        <p className="text-sm text-neutral-500 text-center mt-5">
          Already have an account?{" "}
          <button onClick={() => setView("login")} className="font-semibold text-ink underline underline-offset-4">
            Log in
          </button>
        </p>
      </div>
    </main>
  );
}
