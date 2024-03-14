import { useState, useMemo, useEffect } from "react";
import { authContext } from "../context/AuthContext";

export default function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("token") || false);

  const value = useMemo(() => ({ isAuth, setIsAuth }), [isAuth]);

  useEffect(() => {
    if (isAuth && window.location.pathname === "/login") {
      window.location.pathname = "/";
    }
    if (!isAuth && window.location.pathname !== "/login") {
      window.location.pathname = "/login";
    }
  }, [isAuth]);

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}
