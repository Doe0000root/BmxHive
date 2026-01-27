import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

 
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser && savedUser !== "undefined") {
        const parsedUser = JSON.parse(savedUser);

        setToken(savedToken);
        setUser({
          ...parsedUser,
          banned: Boolean(parsedUser.banned),
        });
      } else {
        clearAuth();
      }
    } catch (err) {
      console.error("AuthContext: corrupted auth state", err);
      clearAuth();
    } finally {
      setIsReady(true);
    }
  }, []);

  
  const login = (token, userData) => {
    if (!token || !userData) return;

    const fullUser = {
      id: userData.id,
      name: userData.name ?? null,
      email: userData.email,
      avatar_url: userData.avatar_url ?? null,
      role: userData.role || "user",
      banned: Boolean(userData.banned),
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(fullUser));

    setToken(token);
    setUser(fullUser);
  };

  
  const logout = (silent = false) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);

    if (!silent) {
      console.log("User logged out");
    }
  };

 useEffect(() => {
  const handler = () => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  };

  window.addEventListener("auth-updated", handler);
  return () => window.removeEventListener("auth-updated", handler);
  }, []);
  const updateUser = (updatedUser) => {
    if (!updatedUser) return;

    const normalized = {
      ...updatedUser,
      banned: Boolean(updatedUser.banned),
    };

    setUser(normalized);
    localStorage.setItem("user", JSON.stringify(normalized));
  };


  const updateBanStatus = (banned) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, banned: Boolean(banned) };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  
  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isReady,
        banned: Boolean(user?.banned), 
        login,
        logout,
        updateUser,
        updateBanStatus,
      }}
    >
      {isReady && children}
    </AuthContext.Provider>
  );
}

