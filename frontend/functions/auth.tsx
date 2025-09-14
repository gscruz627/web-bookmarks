import { jwtDecode } from "jwt-decode";
import state from "../store";
import type { NavigateFunction } from "react-router-dom";
import type { CustomJwtPayload } from "../enums";

let refreshPromise: Promise<boolean> | null = null;

export default async function checkAuth(navigate: NavigateFunction): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise; // 👈 reuse in-flight request
  }

  if (new Date().getTime() < Number(state.expiry) * 1000) {
    return true;
  }

  refreshPromise = (async () => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    try {
      const request = await fetch(`${SERVER_URL}/api/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          accessToken: state.token,
          refreshToken: state.refreshToken
        })
      });

      if (!request.ok) {
        refreshPromise = null;
        navigate("/login")
        return false;
      }

      const tokens = await request.json();

      state.token = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.expiry = String(jwtDecode<CustomJwtPayload>(tokens.accessToken).exp);

      localStorage.setItem("access-token", tokens.accessToken);
      localStorage.setItem("refresh-token", tokens.refreshToken);
      localStorage.setItem("expiry-date", String(jwtDecode<CustomJwtPayload>(tokens.accessToken).exp)!);
        
      refreshPromise = null;
      return true;
    } catch {
      refreshPromise = null;
      navigate("/login")
      return false;
    }
  })();

  return refreshPromise;
}