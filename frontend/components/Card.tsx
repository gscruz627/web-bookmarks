import { useEffect, useRef, useState } from "react";
import {MediaType} from "../enums"
import "../styles/Card.css"
import checkAuth from "../functions/auth";
import { useNavigate } from "react-router-dom";
interface props{
    id: number,
    archive?: () => void;
    iconUrl: string,
    title: string,
    link: string,
    folders: Array<string>
    baseSite: string,
    mediaType: MediaType,
    archived?: boolean,
    onExit?: () => void
}
export default function Card({onExit, id, archive, baseSite, title, iconUrl, folders, link, mediaType, archived}: props) {

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const [addToFolder, setAddToFolder] = useState<boolean>(false);
    const folderRef = useRef<HTMLSelectElement>(null);
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const [foldersList, setFoldersList] = useState<Array<any>>([]);

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
            setFoldersList(foldersResponse);
        } catch(error:any){
            alert(error.message)
        }
    }

    async function handleAddToFolder(){
        const folderId: string | undefined = folderRef.current?.value;
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/folders/${folderId}/bookmarks`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Accept" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                },
                body: JSON.stringify({
                    bookmarkId: id
                })
            });
            if(!request.ok){
                alert("something went wrong while adding this bookmark to this folder");
            }
            onExit?.();
        } catch(error:any){
            alert(error.message);
        }
    }

    useEffect( () => {
        loadFolders();
    }, [])
    return (
        <>
        {addToFolder && 
            <div className="modal-box">
                <form onSubmit={handleAddToFolder}>
                    <h3>Add to a Folder</h3>
                    <label htmlFor="folder">Folder: </label>
                    <select id="folder" ref={folderRef}>
                        {foldersList && foldersList.map( (folder:any) => (
                            <option value={folder.id}>{folder.title}</option>
                        ))}
                    </select>
                </form>
            </div>}
        <div>
        <a href={link} style={{textDecoration:"none", color: "black"}}>
            <div id="card">
                <div>
                    <img src={iconUrl}></img>
                    <h4>{baseSite}</h4>
                </div>
                <p>{title}</p>
                <div>
                    <span>{mediaType}</span>
                    {folders && folders.map( (folder) => (
                        <span>{folder}</span>
                    ))}
                </div>
            </div>
        </a>
        {!archived ?
            <div className="button-container-two">
                <button onClick={archive} className="archive-button"><i className="fa-solid fa-trash-can"/> &nbsp; Archive</button>
                <button onClick={() => setAddToFolder(true)} className="restore-button"><i className="fa-solid fa-circle-plus"></i> Add To Folder</button>
            </div>
            :
            <div className="button-container-two">
                <button className="archive-button"><i className="fa-solid fa-circle-xmark"></i> &nbsp; Delete</button>
                <button className="restore-button"><i className="fa-solid fa-arrow-rotate-left"></i> &nbsp; Restore </button>
            </div>
        }
        </div>
        </>
    )
}