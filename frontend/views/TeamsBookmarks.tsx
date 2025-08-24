import { useNavigate, useParams } from "react-router-dom";
import { MediaType } from "../enums";
import { useEffect, useState } from "react";
import useSortedBookmarks from "../hooks/useSortedBookmarks";
import checkAuth from "../functions/auth";
import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import FilterBox from "../components/FilterBox";
import Card from "../components/Card";
import NewBookmark from "../components/NewBookmark";
import Confirm from "../components/Confirm"

type Props = {}

export default function TeamsBookmarks({}: Props) {
    const {id} = useParams()
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [newBookmark, setNewBookmmark] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [allBookmarks, setAllBookmarks] = useState<Array<any>>([]);
    const [error, setError] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<string>("Oldest to Newest (Added)");
    const [bookmarks, setBookmarks] = useState<Array<any>>([]);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [sectionTitle, setSectionTitle] = useState<string>("");
    const [copiedLink, setCopiedLink] = useState<boolean>(false);
    const [ownerId, setOwnerId] = useState<string>("");
    const [viewMembers, setViewMembers] = useState<boolean>(false);
    const [members, setMembers] = useState<Array<any>>([]);
    const [confirmLeave, setConfirmLeave] = useState<boolean>(false);
    const navigate = useNavigate();
    const sortedBookmarks = useSortedBookmarks(allBookmarks, filter, search, mediaFilter);

    async function loadBookmarks(){
        try{
            setLoading(true);
            console.log(localStorage.getItem("refresh-token"))
            await checkAuth(navigate);
            console.log(localStorage.getItem("refresh-token"))
            const userId = localStorage.getItem("userId");
            const request = await fetch(`${SERVER_URL}/api/teams/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`
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
            setSectionTitle(team.title);
            setOwnerId(team.ownerID);
            setAllBookmarks(team.bookmarks);
            setBookmarks(team.bookmarks);
            setMembers(team.members);
        } catch(errorMsg:any){
            setError("error" + errorMsg.message);
        } finally{
            setLoading(false);
        }
    }

    async function deleteTeam(){
        setLoading(true);
        try{
            const request = await fetch(`${SERVER_URL}/api/teams/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                }
            })
            if(!request.ok){
                setError("Something went wrong while deleting the team, you may not be the owner of the team");
                return;
            }
            navigate("/dashboard");
        } catch(error:any){
            setError("Server error " + error.message);
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
        if(userId === localStorage.getItem("userId")){
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
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`,
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    userId
                })
            });
            if(!request.ok){
                setError("Something went wrong while removing this user, code: " + request.status);
            }
            if(userId === localStorage.getItem("userId")){
                navigate("/dashboard")
            }
            loadBookmarks();
        } catch(error: any){
            setError("Server error: " + error.message);
        }
    }

    useEffect( () => {
        loadBookmarks();
    }, [id])
    return (
        <>
            {loading && <Loading/>}

            {newBookmark &&
                <NewBookmark onExit={() =>setNewBookmmark(false)} onAdd={setAllBookmarks} teamId={id}/>
            }

            {confirmDelete &&
                <Confirm next={() => deleteTeam()} typeText="Team" onExit={() => setConfirmDelete(false)}/>
            }

            {confirmLeave &&
                <Confirm next={() => kickMember(localStorage.getItem("userId")!)} typeText="Leave" onExit={() => setConfirmLeave(false)}/>
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
                        {members && members.length > 0 && members.map((member) => {
                            const loggedInUserId = localStorage.getItem("userId");

                            return (
                                <li key={member.id}>
                                    <p>
                                        <i
                                            className={
                                                member.id === ownerId
                                                    ? "fa-solid fa-user-gear"
                                                    : "fa-regular fa-circle-user"
                                            }
                                        ></i>{" "}
                                        {member.username}
                                    </p>

                                    {loggedInUserId === ownerId && member.id !== ownerId && (
                                        <span onClick={() => kickMember(member.id)}>
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
                    <div id="dashboard-body-nav">
                        <form>
                            <input type="text" name="search" id="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
                        </form>
                        <button onClick={() => setNewBookmmark(true)} style={{backgroundColor: "#8645ff"}}>New Bookmark <i  className="fa-solid fa-circle-plus"></i> </button>
                        {(ownerId === localStorage.getItem("userId")) && <button onClick={() => setConfirmDelete(true)} style={{backgroundColor: "#971717", marginLeft: "1rem"}}>Delete Team <i className="fa-solid fa-trash"></i></button>}
                        {(ownerId !== localStorage.getItem("userId")) && <button onClick={() => setConfirmLeave(true)} style={{backgroundColor: "#971717",marginLeft: "1rem"}}>Leave Team <i className="fa-solid fa-door-open"></i></button>}
                        <button className="just-button" onClick={() => setViewMembers(true)} style={{margin: "0 1rem"}}><i className="fa-solid fa-people-group"></i></button>
                        <button className="just-button" onClick={() => copyLink()}><i className="fa-solid fa-user-plus"></i></button>
                        
                        </div>

                        <FilterBox filter={filter} setFilter={setFilter} sectionTitle={sectionTitle} onExit={() => loadBookmarks()} teamId={id}/>                    

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
                                <Card bookmark={bookmark} id={bookmark.id} title={bookmark.title} baseSite={bookmark.baseSite} iconUrl={bookmark.iconURL} mediaType={bookmark.mediaType}  archived={bookmark.archived} folders={bookmark.folders} key={bookmark.id} link={bookmark.link} ></Card>
                            ))
                        }
                    </div>
                </div>

            </div>
        </>
    )
}