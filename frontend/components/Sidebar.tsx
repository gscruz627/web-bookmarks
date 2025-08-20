import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddFolder from "../components/AddFolder"
import checkAuth from "../functions/auth";

type Props = {}

export default function Sidebar({}: Props) {

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("access-token");
    const [showNav, setShowNav] = useState<boolean>(true);
    const [folders, setFolders] = useState<Array<any>>([]);
    const username = localStorage.getItem("username");
    const [addFolder, setAddFolder] = useState<boolean>(false);
    const navigate = useNavigate();

    async function loadFolders(){
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/folders?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`,
                    "Accept" : "Application/json"
                }
            });
            const foldersResponse = await request.json();
            setFolders(foldersResponse);
        } catch(error:any){
            alert(error.message)
        }
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
        loadFolders();
    }, [])
    return (
        <>
        {addFolder && <AddFolder onAdd={setFolders} onExit={() => setAddFolder(false)}/>}
        <nav>
            <Link to="/"><h3>Web Bookmarks </h3></Link>
            <i onClick={() => setShowNav(prev => !prev)} className="fa-solid fa-bars"></i>
            { showNav && 
            <div id="show-nav">
                <div id="user-profile">
                    <span>{username![0].toUpperCase()}</span>
                    <p>{username}</p>
                </div>
                <ul>
                    <li onClick={() => navigate("/dashboard")}><i className="fa-solid fa-bookmark"></i>All Bookmarks</li>
                    <li onClick={() => navigate("/archived")}><i className="fa-solid fa-trash-can"></i>Archive</li>
                    <li onClick={() => navigate("/private")}><i className="fa-solid fa-eye-slash"></i>Private Vault</li>
                </ul>
                <hr/>
                <ul>
                    {folders.length > 0 ?
                     folders.map( (folder) => (
                        <li><i className="fa-solid fa-folder"></i>{folder.title}</li>
                    )) 
                    :
                        <div className="sidebar-message">
                            <p>Your folders will appear here! </p>
                        </div>
                    }
                    <button onClick={() => setAddFolder(true)} className="blue-inverted-button" style={{margin:"1rem 0", width:"100%"}}>New Folder <i className="fa-solid fa-circle-plus"></i></button>
                </ul>
                <hr/>
                <ul>
                    <li><i className="fa-solid fa-right-from-bracket"></i>Log Out</li>
                    <li><i className="fa-solid fa-moon"></i>Dark Theme</li>
                </ul>
            </div>
            }
        </nav>
        </>
    )
}