import { useEffect } from "react";
import { useSnapshot } from "valtio";
import state from "../store"; 

export default function useTheme() {
  const snap = useSnapshot(state);

  useEffect(() => {
    console.log(snap.theme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(snap.theme);
    localStorage.setItem("theme", snap.theme);
  }, [snap.theme]);

  const toggleTheme = () => {
    state.theme = snap.theme === "dark" ? "light" : "dark";
  };

  return { theme: snap.theme, toggleTheme };
}
