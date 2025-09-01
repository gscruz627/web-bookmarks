import { useEffect, useRef, useState } from "react";
import {MediaType} from "../enums"
import "../styles/Card.css"
import checkAuth from "../functions/auth";
import { useNavigate } from "react-router-dom";
import EditBookmark from "../components/EditBookmark"
import Confirm from "./Confirm";
import Loading from "./Loading";
interface props{
    id: string,
    archive?: () => void;
    iconUrl: string,
    title: string,
    link: string,
    folders: Array<string>
    baseSite: string,
    mediaType: MediaType,
    archived?: boolean,
    bookmark: any,
    privateBookmark?: boolean,
    dek?: CryptoKey,
    folderId?: string,
    teamId?: string
    onExit?: () => void
}
export default function Card({teamId, folderId, dek, bookmark, onExit, id, archive, baseSite, title, iconUrl, folders, link, mediaType, archived, privateBookmark}: props) {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const [addToFolder, setAddToFolder] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const folderRef = useRef<HTMLSelectElement>(null);
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const [foldersList, setFoldersList] = useState<Array<any>>([]);
    const [editing, setEditing] = useState<boolean>(false);

    async function loadFolders(){
        setLoading(true);
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/folders?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Content-type" : "text/plain",
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`,
                    "Accept" : "Application/json"
                }
            });
            const foldersResponse = await request.json();
            setFoldersList(foldersResponse);
        } catch(error:any){
            setError(error.message)
        } finally{
            setLoading(false)
        }
    }

    async function handleAddToFolder(e: React.FormEvent){
        e.preventDefault();
        const folderId: string | undefined = folderRef.current?.value;
        try{
            setLoading(true);
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/folders/${folderId}/bookmarks`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Accept" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                },
                body: JSON.stringify({
                    "bookmarkID": id
                })
            });
            if(!request.ok){
                const message = await request.json();
                setError(message);
            }
            setAddToFolder(false);
        } catch(error:any){
            alert(error.message);
        } finally{
            setLoading(false);
        }
    }
    async function deleteBookmark(id:string){
        setLoading(true);
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/bookmarks/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`,
                }
            })
            if(!request.ok){
                const message = await request.json();
                setError(message);
            }
            setConfirmDelete(false);
            onExit?.();
        } catch(error:any){
            setError(error.message)
        } finally{
            setLoading(false);
        }
    }

    async function restore(){
        setLoading(true);
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/bookmarks/${id}`, {
                method: "PATCH",
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem('access-token')}`,
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
            onExit?.();
        } catch(error: any){
            setError(error.Message)
        } finally{
            setLoading(true)
        }
    }

    async function removeFromFolder(){
        setLoading(true)
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/folders/${folderId}/bookmarks`, {
                method: "DELETE",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                },
                body: JSON.stringify({
                    "bookmarkID": id
                })
            });
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
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
        {loading && <Loading/>}
        {editing && <EditBookmark id={id} dek={dek} onExit={() => setEditing(false)} onAdd={() => onExit?.()} cardInfo={bookmark} />}
        {confirmDelete &&
            <Confirm typeText="Bookmark" onExit={() => setConfirmDelete(false)} next={() => deleteBookmark(id)}/>
        }
        {addToFolder && 
            <div className="modal-box">
                <form onSubmit={handleAddToFolder}>
                    <h2>Add to a Folder</h2>
                    <a role="button" onClick={() => setAddToFolder(false)}>Cancel</a>
                    <label htmlFor="folder">Folder: </label>
                    <select id="folder" ref={folderRef}>
                        {foldersList && foldersList.map( (folder:any) => (
                            <option value={folder.id}>{folder.title}</option>
                        ))}
                    </select>
                    <button type="submit">Add</button>
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
                    {folders && folders.map( (folder:any) => (
                        <span style={{backgroundColor: "#eee78bff"}}>{folder.title}</span>
                    ))}
                </div>
            </div>
        </a>
        {(privateBookmark || teamId)  &&
            <div className="button-container-two">
                <button onClick={() => setConfirmDelete(true)} className="archive-button"><i className="fa-solid fa-circle-xmark"></i> &nbsp; Delete</button>
                <button onClick={() => setEditing(true)} className="edit-button"><i className="fa-solid fa-square-pen"></i> &nbsp; Edit </button>
            </div>
        }
        {folderId &&
        <div>
            <button onClick={() => removeFromFolder()} className="archive-button"><i className="fa-solid fa-circle-xmark"></i> &nbsp; Remove From Folder</button>
        </div>
        }
        {(!privateBookmark && !archived && !folderId && !teamId) &&
            <div className="button-container-three">
                <button onClick={archive} className="archive-button"><i className="fa-solid fa-trash-can"/> &nbsp; Archive</button>
                <button onClick={() => setAddToFolder(true)} className="restore-button"><i className="fa-solid fa-circle-plus"></i> &nbsp;Folder</button>
                <button onClick={() => setEditing(true)} className="edit-button"><i className="fa-solid fa-square-pen"></i></button>
            </div>
        }
        {(!privateBookmark && archived && !folderId && !teamId) && 
            <div className="button-container-two">
                <button onClick={() => setConfirmDelete(true)} className="archive-button"><i className="fa-solid fa-circle-xmark"></i> &nbsp; Delete</button>
                <button onClick={() => restore()} className="restore-button"><i className="fa-solid fa-arrow-rotate-left"></i> &nbsp; Restore </button>
            </div>
        }
        </div>
        </>
    )
}