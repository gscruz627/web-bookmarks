export default function logout(navigate:any){
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("expiry-date");
    navigate("/login");
}