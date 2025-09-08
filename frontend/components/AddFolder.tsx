import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import checkAuth from "../functions/auth";
import state from "../store";

type Props = {
    onExit: () => void
}

export default function AddFolder({onExit}: Props) {

    // @ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const navigate = useNavigate();
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const titleRef = useRef<HTMLInputElement>(null);


    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();

        setLoading(true);
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/folders`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Accept" : "application/json",
                    "Authorization": `Bearer ${state.token}`
                },
                body: JSON.stringify({
                    title: titleRef.current?.value,
                })
            });
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
            }
            const folder = await request.json();
            state.folders.push(folder);
            onExit();
        } catch(err:unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }
    }
    return (
        <>
        {loading && <Loading/>}
        <div className="modal-box">
            <form onSubmit={handleSubmit}>
                <h2>Add New Folder</h2>
                <a role="button" onClick={onExit}>Cancel</a>
                {error && <div className="error-box">{error} <span onClick={() => setError("")}>X</span></div>}
                <label htmlFor="title">Name this folder: </label>
                <input type="text" id="title" ref={titleRef}></input>
                <button type="submit">Create</button>
            </form>
        </div>
        </>
    )
}