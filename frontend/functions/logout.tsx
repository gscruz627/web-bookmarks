import type { NavigateFunction } from "react-router-dom";

export default function logout(navigate:NavigateFunction){
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("expiry-date");
    navigate("/login");
}