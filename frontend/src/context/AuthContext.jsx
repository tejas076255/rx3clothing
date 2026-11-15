import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchMe,
  getToken,
  login as apiLogin,
  logout as apiLogout,
  setToken,
  signup as apiSignup,
} from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Restore the session on load; drop the token if the server rejects it.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (getToken()) {
        try {
          const data = await fetchMe();
          if (alive) setUser(data.user);
        } catch {
          setToken(null);
          if (alive) setUser(null);
        }
      }
      if (alive) setAuthReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, password) => {
    const data = await apiSignup(name, email, password);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const value = { user, authReady, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
