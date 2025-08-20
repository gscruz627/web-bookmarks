import { useRef, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css"

type Props = {}

export default function Register({}: Props) {

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const navigate = useNavigate();

    const usernameRef = useRef<HTMLInputElement>(null);
    const [password, setPassword] = useState<string>("");
    const [passwordCheck, setPasswordCheck] = useState<string>("");
    const [error, setError] = useState<string>("");

    async function handleSubmit(e: React.FormEvent){
        
        e.preventDefault();
        try{
            const request: Response = await fetch(`${SERVER_URL}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    username: usernameRef.current?.value,
                    password: password
                })
            });
            const tokens: any = await request.json();
            if(!request.ok){
                setError(tokens);
                return;
            }
            localStorage.setItem("access-token", tokens.accessToken);
            localStorage.setItem("refresh-token", tokens.refreshToken);
            navigate("/login");
        } catch(errorMsg:any) {
            setError(errorMsg.message);
        }



    }
    useEffect( () => {
        if(password !== passwordCheck){
            setError("Passwords do not match")
        }
        else if(password.length < 8){
            setError("Password needs to be at least 8 characters long");
        } else {
            setError("")
        }
    }, [password, passwordCheck]);
    return (
        <div className="center-box">
            <h2>Web<br/> Bookmarks</h2>
            <form onSubmit={handleSubmit}>
                <b>{error != "" && error}</b>
                <h2>Register with Username:</h2>
                <label htmlFor="username">Username: </label>
                <input ref={usernameRef} type="username" name="username" id="username" />
                <label htmlFor="password">Password: </label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" id="password" />
                <label htmlFor="passwordCheck">Verify: </label>
                <input value={passwordCheck} onChange={(e) => setPasswordCheck(e.target.value)} type="password" name="passwordCheck" id="passwordCheck" />
                <button type="submit">Register</button>
                <Link to="/login"><small>Log In instead.</small></Link>
            </form>
        </div>
    )
}