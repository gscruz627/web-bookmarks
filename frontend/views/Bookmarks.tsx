import { useState, useEffect, useRef } from "react";
import Card from "../components/Card";
import NewBookmark from "../components/NewBookmark"
import { MediaType, DashboardSelection } from "../enums";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"
import "../styles/Bookmarks.css";
import checkAuth from "../functions/auth";
import Loading from "../components/Loading";
import useSortedBookmarks from "../hooks/useSortedBookmarks";
import FilterBox from "../components/FilterBox"
export default function Bookmarks() {

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [newBookmark, setNewBookmmark] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [allBookmarks, setAllBookmarks] = useState<Array<any>>([]);
    const [error, setError] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<string>("Oldest to Newest (Added)");
    const [bookmarks, setBookmarks] = useState<Array<any>>([]);
    const navigate = useNavigate();

    const sortedBookmarks = useSortedBookmarks(allBookmarks, filter, search, mediaFilter);

    async function loadBookmarks(){
        try{
            setLoading(true);
            console.log(localStorage.getItem("refresh-token"))
            await checkAuth(navigate);
            console.log(localStorage.getItem("refresh-token"))
            const userId = localStorage.getItem("userId");
            const request = await fetch(`${SERVER_URL}/api/bookmarks/?userId=${userId}&archived=false`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`
                }
            });
            if(!request.ok){
                setError("Something wrong happened while getting your bookmarks");
            }
            const bookmarksResponse = await request.json();
            setAllBookmarks(bookmarksResponse);
            setBookmarks(bookmarksResponse);
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
    useEffect( () => {
        loadBookmarks();
    }, [])

    return (
        <>
        {loading && <Loading/>}
        {newBookmark &&
            <NewBookmark onExit={() =>setNewBookmmark(false)} onAdd={setAllBookmarks}/>
        }
        <div id="dashboard">
            <Sidebar/>

            <div id="dashboard-body">
                {error && <div className="error-box">{error}</div> }
                <div id="dashboard-body-nav">
                    <form>
                        <input type="text" name="search" id="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
                    </form>

                    <button onClick={() => setNewBookmmark(true)}>New Bookmark <i style={{}} className="fa-solid fa-circle-plus"></i> </button>
                    
                </div>

                <FilterBox filter={filter} setFilter={setFilter} sectionTitle="All Bookmarks"/>
                

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
                            <Card bookmark={bookmark} archive={() => archive(bookmark.id)} id={bookmark.id} title={bookmark.title} baseSite={bookmark.baseSite} iconUrl={bookmark.iconURL} mediaType={bookmark.mediaType}  archived={bookmark.archived} folders={bookmark.folders} key={bookmark.id} link={bookmark.link} onExit={() => loadBookmarks()} ></Card>
                        ))
                    }
                </div>
            </div>

        </div>
        </>
    )
}
