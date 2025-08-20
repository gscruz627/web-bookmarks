import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/Auth.css";

type Props = {}

export default function Login({}: Props) {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        try{
            const request = await fetch(`${SERVER_URL}/api/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Accept" : "application/json"
                },
                body: JSON.stringify({
                    username: usernameRef.current?.value,
                    password: passwordRef.current?.value
                })
            })
            const tokens = await request.json();
            if(!request.ok){
                setError(tokens);
            };
            localStorage.setItem("access-token", tokens.accessToken);
            localStorage.setItem("refresh-token", tokens.refreshToken);
            const contents: any = jwtDecode(tokens.accessToken);
            const username = contents["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
            const userId = contents["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
            const expiryTime = contents.exp;
            localStorage.setItem("userId", userId);
            localStorage.setItem("username", username!);
            localStorage.setItem("expiry-date", String(expiryTime)!);
            navigate("/dashboard");
        } catch(error: any){
            setError(error.message);
        }
    }
    return (
        <div className="center-box">
            <h2>Web<br/> Bookmarks</h2>
            <form onSubmit={handleSubmit}>
                <b>{error != "" && error}</b>
                <h2>Login with Username</h2>
                <label htmlFor="username">Username: </label>
                <input ref={usernameRef} type="text" name="username" id="username" />
                <label htmlFor="password">Password: </label>
                <input ref={passwordRef} type="password" name="password" id="password" />
                <button type="submit">Login</button>

                <Link to="/register"><small>I don't have an account</small></Link>
            </form>
        </div>
    )
}