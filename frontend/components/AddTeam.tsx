import { useRef, useState } from "react";
import Loading from "./Loading";

type Props = {
    onExit: () => void,
    onAdd: (prev: any) => void
}

export default function AddTeam({onExit, onAdd}: Props) {

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const token = localStorage.getItem("access-token");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const titleRef = useRef<HTMLInputElement>(null);
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();

        setLoading(true);
        try{
            const request = await fetch(`${SERVER_URL}/api/teams`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Accept" : "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: titleRef.current?.value,
                })
            });
            if(!request.ok){
                setError("Something went wrong when adding a new folder, code: " + request.status);
            }
            const folder = await request.json();
            onAdd((list:any) => [...list, folder]);
            onExit();
        } catch(errorMsg:any){
            setError(errorMsg.message);
        } finally{
            setLoading(false);
        }
    }
    return (
        <>
        {loading && <Loading/>}
        <div className="modal-box">
            <form onSubmit={handleSubmit}>
                <h2>Add New Team</h2>
                <a role="button" onClick={onExit}>Cancel</a>
                {error && <div className="error-box">{error} <span onClick={() => setError("")}>X</span></div>}
                <label htmlFor="title">Name this team: </label>
                <input type="text" id="title" ref={titleRef}></input>
                <button type="submit">Create</button>
            </form>
        </div>
        </>
    )
}