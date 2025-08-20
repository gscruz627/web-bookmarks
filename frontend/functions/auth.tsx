import { jwtDecode } from "jwt-decode";

let refreshPromise: Promise<boolean> | null = null;

export default async function checkAuth(navigate: any): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise; // 👈 reuse in-flight request
  }

  const tokenExpiryDate = localStorage.getItem("expiry-date");
  if (new Date().getTime() < Number(tokenExpiryDate) * 1000) {
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
          accessToken: localStorage.getItem("access-token"),
          refreshToken: localStorage.getItem("refresh-token")
        })
      });

      if (!request.ok) {
        refreshPromise = null;
        return false;
      }

      const tokens = await request.json();
      localStorage.setItem("access-token", tokens.accessToken);
      localStorage.setItem("refresh-token", tokens.refreshToken);
      localStorage.setItem("expiry-date", String(jwtDecode<any>(tokens.accessToken).exp));

      refreshPromise = null;
      return true;
    } catch {
      refreshPromise = null;
      return false;
    }
  })();

  return refreshPromise;
}