import { useRef, useState, useEffect } from "react"
import { Link } from "react-router-dom";
import "../styles/Auth.css"

type Props = {}

export default function Register({}: Props) {
    const emailRef = useRef<HTMLInputElement>(null);
    const [password, setPassword] = useState<string>("");
    const [passwordCheck, setPasswordCheck] = useState<string>("");
    const [error, setError] = useState<string>("");

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
            <form>
                <b>{error != "" && error}</b>
                <h2>Register with Email</h2>
                <label htmlFor="email">Email: </label>
                <input ref={emailRef} type="email" name="email" id="email" />
                <label htmlFor="password">Username: </label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" id="password" />
                <label htmlFor="passwordCheck">Verify: </label>
                <input value={passwordCheck} onChange={(e) => setPasswordCheck(e.target.value)} type="password" name="passwordCheck" id="passwordCheck" />
                <button type="submit">Login</button>
                <Link to="/login"><small>Log In instead.</small></Link>
            </form>
        </div>
    )
}