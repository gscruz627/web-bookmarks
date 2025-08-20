import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MediaType } from "../enums";

import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import FilterBox from "../components/FilterBox";
import Card from "../components/Card";

import useSortedBookmarks from "../hooks/useSortedBookmarks";
import checkAuth from "../functions/auth";

type Props = {}

export default function ArchivedBookmarks({}: Props) {

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
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
                const request = await fetch(`${SERVER_URL}/api/bookmarks/?userId=${userId}&archived=true`, {
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
            <FilterBox filter={filter} setFilter={setFilter}/>

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
                    sortedBookmarks.map((bookmark:any) => (
                        <Card id={bookmark.id} title={bookmark.title} baseSite={bookmark.baseSite} iconUrl={bookmark.iconURL} mediaType={bookmark.mediaType}  archived={bookmark.archived} folders={bookmark.folders} key={bookmark.id} link={bookmark.link} ></Card>
                    ))
                }
                    </div>
                </div>
            </div>
        </>
    )
}