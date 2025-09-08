import { useState, useRef, useEffect } from "react";
import EditTitle from "../components/EditTitle"
import Loading from "./Loading";
import state from "../store";

type Props = {
    filter: string,
    setFilter: (filter: string) => void,
    sectionTitle: string,
    folderId?: string,
    teamId?: string,
    onExit?: () => void
}

export default function FilterBox({onExit, filter, setFilter, sectionTitle, folderId, teamId}: Props) {
    // @ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [editing, setEditing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const titleRef = useRef<HTMLInputElement>(null);
    const filterBoxRef = useRef<HTMLDivElement | null>(null);
    const filterButtonRef = useRef<HTMLAnchorElement | null>(null);

    async function handleNameChange(e: React.FormEvent){
        e.preventDefault();
        setLoading(true);
        let route:string = SERVER_URL;
        if(folderId != null){
            route += `/api/folders/${folderId}`
        } else {
            route += `/api/teams/${teamId}`
        }
        try{
            const request = await fetch(route, {
                method: "PATCH",
                headers: {
                    "Authorization" : `Bearer ${state.token}`,
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    title: titleRef.current?.value
                })
            });
            const teamOrFolder = await request.json();
            if(!request.ok){
                setError(teamOrFolder);
            }
            setEditing(false);
            if(folderId){
                state.folders = state.folders.map(f => f.id === folderId ? teamOrFolder : f);
            } else {
                state.teams = state.teams.map(t => t.id === teamId ? teamOrFolder : t);
            }
            onExit?.();
        } catch(err: unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }

    }
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                filterBoxRef.current &&
                !filterBoxRef.current.contains(event.target as Node) &&
                filterButtonRef.current &&
                !filterButtonRef.current.contains(event.target as Node)
            ) {
                setShowFilter(false);
            }
        }

        if (showFilter) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showFilter]);

    return (
        <>
        {loading && <Loading/>}
        {editing && <EditTitle onExit={() => setEditing(false)} error={error} titleRef={titleRef} handleNameChange={handleNameChange}/>}
        <div id="filter-box">
            <h3>{sectionTitle}
                {(!["All Bookmarks", "Archived Bookmarks", "Private Vault"].includes(sectionTitle)) && <span onClick={() => setEditing(true)}>
                    <i style={{
                        fontSize: "24px",
                        cursor: "pointer",
                        color: "#f2a42f",
                        marginLeft: "1rem"
                    }} className="fa-solid fa-square-pen"></i>
                    </span>}
            </h3>
            <a ref={filterButtonRef}
                href="#"
                role="button"
                onClick={(e) => {
                    e.preventDefault();
                    setShowFilter(prev => !prev);
                }}
            >
                <i className="fa-regular fa-calendar-days"></i> &nbsp; {filter}
            </a>
                        
        </div>
        <div ref={filterBoxRef} id="filter-container" style={{display: showFilter ? "block" : "none"}}>
            <ul>
                <li onClick={() => { setFilter("Newest to Oldest (Added)"); setShowFilter(false); }}>
                    <i className="fa-regular fa-calendar-days"></i> Newest to Oldest (Added)
                </li>

                <li onClick={() => { setFilter("Oldest to Newest (Added)"); setShowFilter(false); }}>
                    <i className="fa-regular fa-calendar-days"></i> Oldest to Newest (Added)
                </li>

                <li onClick={() => { setFilter("By Base Website (A-Z)"); setShowFilter(false); }}>
                    <i className="fa-regular fa-window-maximize"></i> By Base Website (A-Z)
                </li>

                <li onClick={() => { setFilter("Alphabetically (A-Z)"); setShowFilter(false); }}>
                    <i className="fa-solid fa-arrow-down-a-z"></i> Alphabetically (A-Z)
                </li>

                <li onClick={() => { setFilter("Reversed Alphabetically (Z-A)"); setShowFilter(false); }}>
                    <i className="fa-solid fa-arrow-up-a-z"></i> Reversed Alphabetically (Z-A)
                </li>
            </ul>
        </div>
        </>
    )
}