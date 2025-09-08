import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MediaType, type BookmarkInfoDTO } from "../enums";
import { useSnapshot } from "valtio";

import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import FilterBox from "../components/FilterBox";
import Card from "../components/Card";

import useSortedBookmarks from "../hooks/useSortedBookmarks";
import checkAuth from "../functions/auth";
import state from "../store";

export default function ArchivedBookmarks() {

    //@ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const snap = useSnapshot(state);
    const navigate = useNavigate();

    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<string>("Oldest to Newest (Added)");


    const sortedBookmarks = useSortedBookmarks(snap.bookmarks as Array<BookmarkInfoDTO>, filter, search, mediaFilter);

        async function loadBookmarks(){
            try{
                setLoading(true);
                await checkAuth(navigate);
                const request = await fetch(`${SERVER_URL}/api/bookmarks/?userId=${state.user?.userId}&archived=true`, {
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
                state.bookmarks = bookmarksResponse;
            } catch(err: unknown){
                setError("Something went wrong: " + err)
            } finally{
                setLoading(false);
            }
        }

    async function restore(id:string){
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
                    archived: false
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
            setLoading(false)
        }
    }
        useEffect( () => {
            loadBookmarks();
        }, [])

    return (
        <>
        {loading && <Loading/>}
        <div id="dashboard">
            <Sidebar/>
            {error && <div className="error-box">{error}</div> }
            <div id="dashboard-body">
                <div id="dashboard-body-nav">
                <form>
                    <input type="text" name="search" id="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>
                </form>
            </div>
            <FilterBox filter={filter} setFilter={setFilter} sectionTitle="Archived Bookmarks"/>

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
                    sortedBookmarks.map((bookmark:BookmarkInfoDTO) => (
                        <Card bookmark={bookmark} restore={() => restore(bookmark.id!)}></Card>
                    ))
                }
                    </div>
                </div>
            </div>
        </>
    )
}