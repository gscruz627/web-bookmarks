import { useState, useEffect} from "react";
import { MediaType, type BookmarkInfoDTO } from "../enums";
import {useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import checkAuth from "../functions/auth";

import Card from "../components/Card";
import NewBookmark from "../components/NewBookmark"
import Sidebar from "../components/Sidebar"
import Loading from "../components/Loading";
import useSortedBookmarks from "../hooks/useSortedBookmarks";
import FilterBox from "../components/FilterBox"
import state from "../store";

export default function Bookmarks() {

    //@ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const snap = useSnapshot(state);
    const navigate = useNavigate();

    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [newBookmark, setNewBookmark] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<string>("Oldest to Newest (Added)");

    const sortedBookmarks = useSortedBookmarks(snap.bookmarks as Array<BookmarkInfoDTO>, filter, search, mediaFilter);

    async function loadBookmarks(){
        setLoading(true);
        try{
            await checkAuth(navigate);
            state.bookmarks = []
            const request = await fetch(`${SERVER_URL}/api/bookmarks/?userId=${snap.user?.userId}&archived=false`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${state.token}`
                }
            });
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
            }
            const bookmarksResponse = await request.json();
            state.bookmarks = bookmarksResponse
        } catch(err: unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }
    }

    async function archive(id:string){
        setLoading(true);
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/bookmarks/${id}`, {
                method: "PATCH",
                headers: {
                    "Authorization" : `Bearer ${state.token}`,
                    "Content-Type" : "Application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    archived: true
                })
            });
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
            }
            state.bookmarks = state.bookmarks.filter(b => b.id !== id)
        } catch(err: unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBookmarks();
    }, [])

    return (
        <>
        {loading && <Loading/>}
        {newBookmark &&
            <NewBookmark onExit={() =>setNewBookmark(false)}/>
        }
        <div id="dashboard">
            <Sidebar/>

            <div id="dashboard-body">
                {error && <div className="error-box">{error}</div> }
                <div id="dashboard-body-nav">
                    <form>
                        <input type="text" name="search" id="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
                    </form>

                    <button onClick={() => setNewBookmark(true)}>New Bookmark <i style={{}} className="fa-solid fa-circle-plus"></i> </button>
                    
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
                            <Card key={bookmark.id} bookmark={bookmark} archive={() => archive(bookmark.id!)}></Card>
                        ))
                    }
                </div>
            </div>

        </div>
        </>
    )
}
