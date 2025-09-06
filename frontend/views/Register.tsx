import { useRef, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css"
import Loading from "../components/Loading";

type Props = {}

export default function Register({}: Props) {

    // @ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const navigate = useNavigate();

    const usernameRef = useRef<HTMLInputElement>(null);
    const [password, setPassword] = useState<string>("");
    const [passwordCheck, setPasswordCheck] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        if(password.length < 8 || (password !== passwordCheck)){
            return;
        }
        setLoading(true);
        try{
            const request: Response = await fetch(`${SERVER_URL}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Accept" : "application/json"
                },
                body: JSON.stringify({
                    username: usernameRef.current?.value,
                    password: password
                })
            });
            if(!request.ok){
                if(request.status === 409){
                    const failure = await request.json();
                    setError(failure);
                } else {
                    setError("Something went wrong with registering your account. Reload & try again.");
                }
                return;
            }
            navigate("/login");
        } catch(errorMsg:any) {
            setError(errorMsg.message);
        } finally{
            setLoading(false);
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
        <>
        {loading && <Loading/>}
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
        </>
    )
}