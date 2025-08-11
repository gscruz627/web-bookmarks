import { useRef } from "react"
import { Link } from "react-router-dom";
import "../styles/Auth.css"

type Props = {}

export default function Login({}: Props) {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    return (
        <div className="center-box">
            <h2>Web<br/> Bookmarks</h2>
            <form>
                <h2>Login with Email</h2>
                <label htmlFor="email">Email: </label>
                <input ref={emailRef} type="email" name="email" id="email" />
                <label htmlFor="password">Username: </label>
                <input ref={passwordRef} type="password" name="password" id="password" />
                <button type="submit">Login</button>

                <Link to="/register"><small>I don't have an account</small></Link>
            </form>
        </div>
    )
}