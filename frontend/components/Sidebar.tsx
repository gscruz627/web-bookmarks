import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import useTheme from "../hooks/useTheme"

import AddFolder from "../components/AddFolder"
import AddTeam from "../components/AddTeam"
import checkAuth from "../functions/auth";
import logout from "../functions/logout"
import state from "../store";

export default function Sidebar() {
    
    // @ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const snap = useSnapshot(state);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [showNav, setShowNav] = useState<boolean>(true);
    const [addFolder, setAddFolder] = useState<boolean>(false);
    const [addTeam, setAddTeam] = useState<boolean>(false);


    async function loadFolders(){
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/folders?userId=${snap.user?.userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${state.token}`,
                    "Accept" : "Application/json"
                }
            });
            const foldersResponse = await request.json();
            state.folders = foldersResponse;
        } catch(err:unknown){
            alert("Something went wrong: " + err)
        }
    }

    async function loadTeams(){
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/teams?userId=${snap.user?.userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${state.token}`
                }
            });
            const teamsResponse = await request.json();
            state.teams = teamsResponse;
        } catch(err: unknown){
            alert("Something went wrong: " + err)
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
        loadTeams();
    }, [])

    return (
        <>
        {addFolder && <AddFolder onExit={() => setAddFolder(false)}/>}
        {addTeam && <AddTeam onExit={() => setAddTeam(false)}/>}
        <nav>
            <Link to="/"><h3>Web Bookmarks </h3></Link>
            <i onClick={() => setShowNav(prev => !prev)} className="fa-solid fa-bars"></i>
            { showNav && 
            <div id="show-nav">
                <div id="user-profile">
                    <span>{snap.user?.username![0].toUpperCase()}</span>
                    <p>{snap.user?.username}</p>
                </div>
                <ul>
                    <li onClick={() => navigate("/dashboard")}><i className="fa-solid fa-bookmark"></i>All Bookmarks</li>
                    <li onClick={() => navigate("/archived")}><i className="fa-solid fa-trash-can"></i>Archive</li>
                    <li onClick={() => navigate("/private")}><i className="fa-solid fa-eye-slash"></i>Private Vault</li>
                </ul>
                <hr/>
                <ul>
                    {snap.folders?.length > 0 ?
                     snap.folders.map( (folder) => (
                        <li key={folder.id} onClick={() => navigate(`/folders/${folder.id}`)}><i className="fa-solid fa-folder"></i>{folder.title}</li>
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
                    {snap.teams.length > 0 ?
                        snap.teams.map( (team) => (
                            <li key={team.id} onClick={() => navigate(`/teams/${team.id}`)}><i className="fa-solid fa-people-group"></i>{team.title}</li>
                        )) 
                    :
                        <div className="sidebar-message">
                            <p>Your teams will appear here!</p>
                        </div>
                    }
                    <button onClick={() => setAddTeam(true)} className="blue-inverted-button" style={{margin: "1rem 0", width: "100%"}}>New Team <i className="fa-solid fa-circle-plus"></i></button>
                </ul>
                <ul>
                    <li onClick={() => navigate("/settings")}><i className="fa-solid fa-gear"></i>Account</li>
                    <li onClick={() => logout(navigate)}><i className="fa-solid fa-right-from-bracket"></i>Log Out</li>
                    <li onClick={toggleTheme}>
                    {theme === "dark" ? (
                        <>
                        <i className="fa-solid fa-sun"></i> Light Theme
                        </>
                    ) : (
                        <>
                        <i className="fa-solid fa-moon"></i> Dark Theme
                        </>
                    )}
                    </li>
                </ul>
            </div>
            }
        </nav>
        </>
    )
}