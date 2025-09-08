import { useNavigate, useParams } from "react-router-dom";
import { MediaType, type BookmarkInfoDTO, type TeamContentDTO, type User } from "../enums";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import state from "../store";
import useSortedBookmarks from "../hooks/useSortedBookmarks";

import checkAuth from "../functions/auth";
import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import FilterBox from "../components/FilterBox";
import Card from "../components/Card";
import NewBookmark from "../components/NewBookmark";
import Confirm from "../components/Confirm"

export default function TeamsBookmarks() {
    const {id} = useParams()
    //@ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    //@ts-ignore
    const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

    const navigate = useNavigate();
    const snap = useSnapshot(state);

    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [newBookmark, setNewBookmmark] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<string>("Oldest to Newest (Added)");
    const [team, setTeam] = useState<TeamContentDTO | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [copiedLink, setCopiedLink] = useState<boolean>(false);
    const [viewMembers, setViewMembers] = useState<boolean>(false);
    const [confirmLeave, setConfirmLeave] = useState<boolean>(false);
    const sortedBookmarks = useSortedBookmarks(snap.bookmarks as Array<BookmarkInfoDTO>, filter, search, mediaFilter);

    async function loadBookmarks(){
        try{
            setLoading(true);
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/teams/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${state.token}`
                }
            });
            if (!request.ok) {
                let errorMessage = "";
                const contentType = request.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    const data = await request.json();
                    errorMessage = data.message || "Unexpected error";
                } else {
                    if(request.status === 404){
                        errorMessage = "Team not found";
                    } else {
                        errorMessage = await request.text();
                    }
                }
                setError(errorMessage);
                return;
            }
            const team = await request.json();
            setTeam(team);
            state.bookmarks = team.bookmarks;
        } catch(err: unknown){
            setError("Something went wrong: " + err);
        } finally{
            setLoading(false);
        }
    }

    async function deleteTeam(){
        setLoading(true);
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/teams/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization" : `Bearer ${state.token}`
                }
            })
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
            }
            navigate("/dashboard");
        } catch(err: unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }
    }

    async function copyLink(){
        try{
            await navigator.clipboard.writeText(`${CLIENT_URL}/join/${id}`);
        } catch(error){
            alert("Could not copy to your clipboard");
        } finally{
            setCopiedLink(true);
        }
    }

    async function kickMember(userId: string){
        let confirmed;
        if(userId === snap.user?.userId){
            confirmed = true;
        } else {
            confirmed = confirm("Are you sure you want to delete this user?");
            if(!confirmed){
                return;
            }
        }
        setLoading(true);
        try{
            const request = await fetch(`${SERVER_URL}/api/teams/${id}/members`, {
                method: "DELETE",
                headers: {
                    "Authorization" : `Bearer ${state.token}`,
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    userId
                })
            });
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
            }
            // User himself is leaving the group.
            if(userId === snap.user?.userId){
                navigate("/dashboard")
            }
            setTeam({...team, members: team?.members.filter((m:User) => m.userId !== userId)} as TeamContentDTO)
        } catch(err: unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }
    }

    useEffect( () => {
        loadBookmarks();
    }, [id])
    return (
        <>
            {loading && <Loading/>}

            {newBookmark &&
                <NewBookmark onExit={() =>setNewBookmmark(false)} teamId={id}/>
            }

            {confirmDelete &&
                <Confirm next={() => deleteTeam()} typeText="Team" onExit={() => setConfirmDelete(false)}/>
            }

            {confirmLeave &&
                <Confirm next={() => kickMember(state.user?.userId!)} typeText="Leave" onExit={() => setConfirmLeave(false)}/>
            }

            {copiedLink &&
                <div className="modal-box">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h3><i className="fa-solid fa-link"></i> &nbsp; Link Copied:</h3><br/>
                        <code>{`${CLIENT_URL}/join/${id}`}</code><br/>
                        <button onClick={() => setCopiedLink(false)}>Got It</button>
                    </form>
                </div>
            }

            {viewMembers &&
                <div className="modal-box">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h3>Team Members</h3>
                        <a role="button" onClick={() => setViewMembers(false)}>Close</a>
                        <ul>
                        {team?.members && team.members.length > 0 && team.members.map((member:User) => {

                            return (
                                <li key={member.userId}>
                                    <p>
                                        <i
                                            className={
                                                member.userId === team.ownerID
                                                    ? "fa-solid fa-user-gear"
                                                    : "fa-regular fa-circle-user"
                                            }
                                        ></i>{" "}
                                        {member.username}
                                    </p>

                                    {(snap.user?.userId === team.ownerID) && (member.userId !== team.ownerID) && (
                                        <span onClick={() => kickMember(member.userId)}>
                                            <i
                                                style={{ color: "#bb1414", cursor: "pointer" }}
                                                className="fa-solid fa-user-minus"
                                            ></i>
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                        </ul>
                    </form>
                </div>
            }

            <div id="dashboard">
                <Sidebar/>

                <div id="dashboard-body">
                    {error && <div className="error-box">{error}</div> }
                    {!error && <>
                    <div id="dashboard-body-nav">
                        <form>
                            <input type="text" name="search" id="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
                        </form>
                        <button onClick={() => setNewBookmmark(true)} style={{backgroundColor: "#8645ff"}}>New Bookmark <i  className="fa-solid fa-circle-plus"></i> </button>
                        {(team && team.ownerID === state.user?.userId) && <button onClick={() => setConfirmDelete(true)} style={{backgroundColor: "#971717", marginLeft: "1rem"}}>Delete Team <i className="fa-solid fa-trash"></i></button>}
                        {(team && team.ownerID !== state.user?.userId) && <button onClick={() => setConfirmLeave(true)} style={{backgroundColor: "#971717",marginLeft: "1rem"}}>Leave Team <i className="fa-solid fa-door-open"></i></button>}
                        <button className="just-button" onClick={() => setViewMembers(true)} style={{margin: "0 1rem"}}><i className="fa-solid fa-people-group"></i></button>
                        <button className="just-button" onClick={() => copyLink()}><i className="fa-solid fa-user-plus"></i></button>
                        
                        </div>

                        <FilterBox filter={filter} setFilter={setFilter} sectionTitle={team?.title ?? ""} teamId={id}/>                    

                    <div id="media-type-selector">
                        <span className={mediaFilter === MediaType.Video ? "media-type-selected" : ""} onClick={() => setMediaFilter(mediaFilter === MediaType.Video ? MediaType.None : MediaType.Video)}><i className="fa-solid fa-file-video"></i> Video</span>
                        <span className={mediaFilter === MediaType.Document ? "media-type-selected" : ""} onClick={() => setMediaFilter(mediaFilter === MediaType.Document ? MediaType.None : MediaType.Document)}><i className="fa-solid fa-file"></i> Document</span>
                        <span className={mediaFilter === MediaType.Image ? "media-type-selected" : ""} onClick={() => setMediaFilter(mediaFilter === MediaType.Image ? MediaType.None : MediaType.Image)}><i className="fa-regular fa-image"></i> Image</span>
                        <span className={mediaFilter === MediaType.Post ? "media-type-selected" : ""} onClick={() => setMediaFilter(mediaFilter === MediaType.Post ? MediaType.None : MediaType.Post)}><i className="fa-solid fa-comments"></i> Post</span>
                    </div>
                    <div id="card-container">
                        {sortedBookmarks.length <= 0 ?
                        
                            <div style={{flexWrap: "wrap", textAlign: "center", gridColumn: "1 / -1", width:"100%", height:"400%", fontSize: "36px", display:"flex", justifyContent:"center", alignContent:"center", flexDirection:"column"}}>
                                <i className="fa-regular fa-bookmark" style={{display: "block"}}></i>
                                <p> No Bookmarks found</p>
                            </div>
                        :
                            sortedBookmarks.map((bookmark) => (
                                <Card bookmark={bookmark} key={bookmark.id} teamId={id}></Card>
                            ))
                        }
                    </div>
                    </>}
                </div>

            </div>
        </>
    )
}