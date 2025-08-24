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

type Props = {
}

export default function FolderBookmarks({}: Props) {
    
    const {id} = useParams()
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [loading, setLoading] = useState<boolean>(false);
    const [allBookmarks, setAllBookmarks] = useState<Array<any>>([]);
    const [error, setError] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<string>("Oldest to Newest (Added)");
    const [bookmarks, setBookmarks] = useState<Array<any>>([]);
    const [sectionTitle ,setSectionTitle] = useState<string>("");
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const navigate = useNavigate();
    const sortedBookmarks = useSortedBookmarks(allBookmarks, filter, search, mediaFilter);
    
    async function loadBookmarks(){
        try{
            setLoading(true);
            console.log(localStorage.getItem("refresh-token"))
            await checkAuth(navigate);
            console.log(localStorage.getItem("refresh-token"))
            const userId = localStorage.getItem("userId");
            const request = await fetch(`${SERVER_URL}/api/folders/${id}`, {
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
            const folder = await request.json();
            setSectionTitle(folder.title);
            setAllBookmarks(folder.bookmarks);
            setBookmarks(folder.bookmarks);
        } catch(errorMsg:any){
            setError(errorMsg.message);
        } finally{
            setLoading(false);
        }
    }

        async function archive(id:number){
        try{
            console.log("HA")
            const request = await fetch(`${SERVER_URL}/api/bookmarks/${id}`, {
                method: "PATCH",
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem('access-token')}`,
                    "Content-Type" : "Application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    archived: true
                })
            });
            if(!request.ok){
                console.log("somethiing went wrong");
                setError("Something went wrong while archiving, please try again.");
                return;
            }
            await loadBookmarks();
        } catch(error: any){
            console.log("something weent wrong");
            setError(error.Message)
        }
    }

    async function deleteFolder(){
        setLoading(true);
        try{
            const request = await fetch(`${SERVER_URL}/api/folders/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                }
            });
            if(!request.ok){
                setError("Something went wrong with deleting this folder: " + request.statusText);
            }
            navigate("/dashboard");
        } catch(error:any){
            setError("Server error: " + error.message)
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
                            <Card bookmark={bookmark} archive={() => archive(bookmark.id)} id={bookmark.id} title={bookmark.title} baseSite={bookmark.baseSite} iconUrl={bookmark.iconURL} mediaType={bookmark.mediaType}  archived={bookmark.archived} folders={bookmark.folders} key={bookmark.id} link={bookmark.link} ></Card>
                        ))
                    }
                </div>
            </div>

        </div>
    </>
    )
}