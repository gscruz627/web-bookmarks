import { useState } from "react"
import Loading from "../components/Loading"

type Props = {
    next: () => void,
    typeText: string,
    onExit: () => void
}

export default function Confirm({next, typeText, onExit}: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    return (
        <>
        {loading && <Loading/>}
        <div className="modal-box">
            <form onSubmit={(e) => e.preventDefault()}>
                <h2>Are you sure you want to 
                    {typeText === "Leave" && "leave this Team?"}
                    {typeText === "Account" && "delete your account?"}
                    {(!["Leave","Account"].includes(typeText)) && `delete this ${typeText}`}
                </h2>
                {error && <div className="error-box">{error} <span onClick={() => setError("")}>X</span></div>}
                <button onClick={onExit} style={{backgroundColor: "#971717"}}>Cancel</button>
                <button onClick={next}>Confirm</button>
            </form>
        </div>
        </>
    )
}