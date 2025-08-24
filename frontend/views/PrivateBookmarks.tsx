import { DashboardSelection, MediaType } from "../enums"
import { useState } from "react";
import useSortedBookmarks from "../hooks/useSortedBookmarks";
import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";

type Props = {}

export default function PrivateBookmarks({}: Props) {
    const [hasUnlocked, setHasUnlocked] = useState<boolean>(false);
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
    const sortedBookmarks = useSortedBookmarks(allBookmarks, filter, search, mediaFilter);
    
    function handleVaultSubmit(e: React.FormEvent){
        e.preventDefault();
        setHasUnlocked(true);
    }
  
    return (
        <>
        {loading && <Loading/>}
        <div id="dashboard">
            <Sidebar/>

            <div id="dashboard-body">
                {error && <div className="error-box">{error}</div>}
                {hasUnlocked ?
                    <p>Hello wold</p>
                :
                <div className="center-box">
                    <form onSubmit={handleVaultSubmit}>
                        <h3>Unlock your vault first</h3>
                        <label htmlFor="vaultPwd">Passphrase: </label>
                        <input type="text" name="vaultPwd" id="vaultPwd" style={{width: "100%"}}/>
                        <button type="submit">Access</button>
                    </form>
                </div>
                }

            </div>
        </div>
        
        </>
    );
}