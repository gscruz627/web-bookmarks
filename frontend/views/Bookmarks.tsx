import { useState, useEffect, useRef } from "react";
import Card from "../components/Card";
import { MediaType, DashboardSelection } from "../enums";
import { Link } from "react-router-dom";
import "../styles/Bookmarks.css";
export default function Bookmarks() {

    const [dashboard, setDashboard] = useState<DashboardSelection>(DashboardSelection.All);
    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [showNav, setShowNav] = useState<boolean>(true);
    const [vaultLocked, setVaultLocked] = useState<boolean>(true);
    const filterBoxRef = useRef<HTMLDivElement | null>(null);
    const filterButtonRef = useRef<HTMLAnchorElement | null>(null);

    function handleVaultSubmit(e: any){
        e.preventDefault();
        setVaultLocked(false);
    }
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 768) {
                setShowNav(true);
            }
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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

    useEffect(() => {if(dashboard !== DashboardSelection.Private) setVaultLocked(true)}, [dashboard])

    return (
        <div id="dashboard">
            <nav>
                <Link to="/"><h3>Web Bookmarks </h3></Link>
                <i onClick={() => setShowNav(prev => !prev)} className="fa-solid fa-bars"></i>
                { showNav && 
                    <div id="show-nav">
                    <div id="user-profile">
                        <span>GL</span>
                        <p>Gustavo L.</p>
                    </div>
                    <ul>
                        <li onClick={() => setDashboard(DashboardSelection.All)}><i className="fa-solid fa-bookmark"></i>All Bookmarks</li>
                        <li onClick={() => setDashboard(DashboardSelection.Archive)}><i className="fa-solid fa-trash-can"></i>Archive</li>
                        <li onClick={() => setDashboard(DashboardSelection.Private)}><i className="fa-solid fa-eye-slash"></i>Private Vault</li>
                        <li onClick={() => setDashboard(DashboardSelection.Shared)}><i className="fa-solid fa-share-from-square"></i>Shared</li>
                    </ul>

                    <hr/>
                    <ul>
                        <li><i className="fa-solid fa-folder"></i>Folder one</li>
                        <li><i className="fa-solid fa-folder"></i>Folder two</li>
                    </ul>
                    
                    <hr/>
                    <ul>
                        <li><i className="fa-solid fa-right-from-bracket"></i>Log Out</li>
                        <li><i className="fa-solid fa-moon"></i>Dark Theme</li>
                    </ul>
                    </div>
                }
            </nav>

            <div id="dashboard-body">
                <form>
                    <input type="text" name="search" id="search" placeholder="Search"/>
                </form>

                {dashboard === DashboardSelection.Private && vaultLocked && (
                    <div className="center-box">
                        <form onSubmit={handleVaultSubmit}>
                            <h3>Unlock your vault first</h3>
                            <label htmlFor="vaultPwd">Passphrase: </label>
                            <input type="text" name="vaultPwd" id="vaultPwd" style={{width: "100%"}}/>

                            <button type="submit">Access</button>
                        </form>
                    </div>
                )}

                {(dashboard !== DashboardSelection.Private || !vaultLocked) &&
                <>
                <div id="filter-box">
                    <h3>{dashboard}</h3>
                    <a ref={filterButtonRef}
                    href="#"
                    role="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setShowFilter(prev => !prev);
                    }}
                    >
                        <i className="fa-regular fa-calendar-days"></i> Newest to Oldest (Added)
                    </a>
                    
                    </div>
                    <div ref={filterBoxRef} id="filter-container" style={{display: showFilter ? "block" : "none"}}>
                        <ul>
                            <li><i className="fa-regular fa-calendar-days"></i> Newest to Oldest (Added)</li>
                            <li><i className="fa-regular fa-calendar-days"></i> Oldest to Newest (Added)</li>
                            <li><i className="fa-regular fa-window-maximize"></i> By Base Website (A-Z)</li>
                            <li><i className="fa-solid fa-arrow-down-a-z"></i> Alphabetically (A-Z)</li>
                            <li><i className="fa-solid fa-arrow-up-a-z"></i> Reversed Alphabetically (Z-A)</li>
                        </ul>
                    </div>

                <div id="media-type-selector">
                    <span className={mediaFilter === MediaType.Video ? "media-type-selected" : ""} onClick={() => setMediaFilter(mediaFilter === MediaType.Video ? MediaType.None : MediaType.Video)}><i className="fa-solid fa-file-video"></i> Video</span>
                    <span className={mediaFilter === MediaType.Document ? "media-type-selected" : ""} onClick={() => setMediaFilter(mediaFilter === MediaType.Document ? MediaType.None : MediaType.Document)}><i className="fa-solid fa-file"></i> Document</span>
                    <span className={mediaFilter === MediaType.Image ? "media-type-selected" : ""} onClick={() => setMediaFilter(mediaFilter === MediaType.Image ? MediaType.None : MediaType.Image)}><i className="fa-regular fa-image"></i> Image</span>
                    <span className={mediaFilter === MediaType.Post ? "media-type-selected" : ""} onClick={() => setMediaFilter(mediaFilter === MediaType.Post ? MediaType.None : MediaType.Post)}><i className="fa-solid fa-comments"></i> Post</span>
                </div>
                <div id="card-container">
                    <Card iconUrl="" title="Title" folders={["title", "boy"]} link="" baseSite="Youtube" mediaType={MediaType.Video} mediaUrl="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F0%2F09%2FYouTube_full-color_icon_(2017).svg%2F2560px-YouTube_full-color_icon_(2017).svg.png&f=1&nofb=1&ipt=a7f13e354644a2fc68fbc00c468d66e530a493f3eb37ac473d8a5a836c854432"/>
                    <Card iconUrl="" title="Title" folders={["title", "boy"]} link="" baseSite="Youtube" mediaType={MediaType.Video} archived={true}/>
                    <Card iconUrl="" title="Title" folders={["title", "boy"]} link="" baseSite="Youtube" mediaType={MediaType.Video}/>
                    <Card iconUrl="" title="Title" folders={["title", "boy"]} link="" baseSite="Youtube" mediaType={MediaType.Video}/>
                </div>
                </>
                }
            </div>

        </div>
    )
}
