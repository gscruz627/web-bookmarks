import { useEffect, useState } from "react";
import { MediaType } from "../enums";
import { useNavigate, useParams } from "react-router-dom";
import useSortedBookmarks from "../hooks/useSortedBookmarks";
import checkAuth from "../functions/auth";
import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import FilterBox from "../components/FilterBox";
import Card from "../components/Card";
import Confirm from "../components/Confirm";
import state from "../store";
import { useSnapshot } from "valtio";

type Props = {
}

export default function FolderBookmarks({}: Props) {
    
    const {id} = useParams()
    //@ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<string>("Oldest to Newest (Added)");
    const [sectionTitle ,setSectionTitle] = useState<string>("");
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const navigate = useNavigate();
    
    const snap = useSnapshot(state);
    const sortedBookmarks = useSortedBookmarks(snap.bookmarks, filter, search, mediaFilter);
    
    async function loadBookmarks(){
        try{
            setLoading(true);
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/folders/${id}`, {
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
            const folder = await request.json();
            setSectionTitle(folder.title);
            state.bookmarks = folder.bookmarks;
        } catch(errorMsg:any){
            setError(errorMsg.message);
        } finally{
            setLoading(false);
        }
    }

    async function removeFromFolder(folderId: string){
            setLoading(true)
            try{
                await checkAuth(navigate);
                const request = await fetch(`${SERVER_URL}/api/folders/${id}/bookmarks`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization" : `Bearer ${state.token}`
                    },
                    body: JSON.stringify({
                        "bookmarkID": folderId
                    })
                });
                if(!request.ok){
                    const message = await request.json();
                    setError(message);
                    return;
                }
                state.bookmarks = state.bookmarks.filter(b => b.id !== folderId);
            } catch(error:any){
                setError(error.message);
            } finally{
                setLoading(false);
            }
        }

    async function deleteFolder(){
        setLoading(true);
        try{
            const request = await fetch(`${SERVER_URL}/api/folders/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization" : `Bearer ${state.token}`
                }
            });
            if(!request.ok){
               const message = await request.json();
               setError(message);
                return;
            }
            navigate("/dashboard");
        } catch(error:any){
            setError(error.message)
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
    
        {confirmDelete &&
            <Confirm next={() => deleteFolder()} typeText="Folder" onExit={() => setConfirmDelete(false)}/>
        }
        

        <div id="dashboard">
            <Sidebar/>

            <div id="dashboard-body">
                {error && <div className="error-box">{error}</div> }
                <div id="dashboard-body-nav">
                    <form>
                        <input type="text" name="search" id="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
                    </form>
                    <button onClick={() => setConfirmDelete(true)} style={{backgroundColor: "#971717", marginLeft: "1rem"}}>Delete Folder <i className="fa-solid fa-trash"></i></button>
                </div>

                <FilterBox filter={filter} setFilter={setFilter} sectionTitle={sectionTitle} onExit={() => loadBookmarks()} folderId={id}/>
                

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
                            <Card key={bookmark.id} folderId={id} bookmark={bookmark} removeFromFolder={() => removeFromFolder(bookmark.id)}></Card>
                        ))
                    }
                </div>
            </div>
        </div>
    </>
    )
}