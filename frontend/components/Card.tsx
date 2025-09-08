import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";

import state from "../store";
import checkAuth from "../functions/auth";
import EditBookmark from "../components/EditBookmark"
import Confirm from "./Confirm";
import Loading from "./Loading";
import type { BookmarkInfoDTO, FolderInfoDTO } from "../enums";

type props = {
    bookmark: BookmarkInfoDTO,
    dek?: CryptoKey,
    folderId?: string,
    teamId?: string,
    archive?: () => void
    restore?: () => void
    onExit?: () => void,
    removeFromFolder?: () => void
}
export default function Card({dek, bookmark, onExit, archive, restore, folderId, teamId, removeFromFolder}: props) {
    // @ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const navigate = useNavigate();
    const snap = useSnapshot(state);

    const [addToFolder, setAddToFolder] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [editing, setEditing] = useState<boolean>(false);
    const folderRef = useRef<HTMLSelectElement>(null);


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
                    "Authorization" : `Bearer ${state.token}`
                },
                body: JSON.stringify({
                    "bookmarkID": bookmark.id
                })
            });
            const bookmarkResponse = await request.json();
            if(!request.ok){
                setError(bookmarkResponse);
                return;
            }
            state.bookmarks = state.bookmarks.map(b => b.id === bookmark.id ? bookmarkResponse : b)
            setAddToFolder(false);
        } catch(err: unknown){
            setError("Something went wrong: " + err)
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
                    "Authorization": `Bearer ${state.token}`,
                }
            })
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
            }
            state.bookmarks = state.bookmarks.filter(b => b.id !== id);
            setConfirmDelete(false);
            onExit?.();
        } catch(err:unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }
    }

    return (
        <>
        {loading && <Loading/>}
        {editing && <EditBookmark dek={dek} onExit={() => setEditing(false)} cardInfo={bookmark} />}
        {confirmDelete &&
            <Confirm typeText="Bookmark" onExit={() => setConfirmDelete(false)} next={() => deleteBookmark(bookmark.id!)}/>
        }
        {addToFolder && 
            <div className="modal-box">
                <form onSubmit={handleAddToFolder}>
                    <h2>Add to a Folder</h2>
                    <a role="button" onClick={() => setAddToFolder(false)}>Cancel</a>
                    <label htmlFor="folder">Folder: </label>
                    <select id="folder" ref={folderRef}>
                    {snap.folders && snap.folders
                    .filter((folder: FolderInfoDTO) =>
                        !bookmark.folders?.some((bf: FolderInfoDTO) => bf.id === folder.id)
                    )
                    .map((folder: FolderInfoDTO) => (
                        <option key={folder.id} value={folder.id}>
                        {folder.title}
                        </option>
                    ))}
                    </select>
                    <button type="submit">Add</button>
                </form>
            </div>}
        <div>
        <a href={bookmark.link} style={{textDecoration:"none", color: "black"}}>
            <div className="card">
                <div>
                    <img src={bookmark.iconURL || bookmark.iconURL}></img>
                    <h4>{bookmark.baseSite}</h4>
                </div>
                <p>{bookmark.title}</p>
                <div>
                    <span>{bookmark.mediaType}</span>
                    {bookmark.folders && bookmark.folders.map( (folder:FolderInfoDTO) => (
                        <span id={folder.id} style={{backgroundColor: "#eee78bff"}}>{folder.title}</span>
                    ))}
                </div>
            </div>
        </a>
        {(dek || teamId)  &&
            <div className="button-container-two">
                <button onClick={() => setConfirmDelete(true)} className="archive-button"><i className="fa-solid fa-circle-xmark"></i> &nbsp; Delete</button>
                <button onClick={() => setEditing(true)} className="edit-button"><i className="fa-solid fa-square-pen"></i> &nbsp; Edit </button>
            </div>
        }
        {folderId &&
        <div>
            <button onClick={removeFromFolder} className="archive-button"><i className="fa-solid fa-circle-xmark"></i> &nbsp; Remove From Folder</button>
        </div>
        }
        {(!dek && !bookmark.archived && !folderId && !teamId) &&
            <div className="button-container-three">
                <button onClick={archive} className="archive-button"><i className="fa-solid fa-trash-can"/> &nbsp; Archive</button>
                <button onClick={() => setAddToFolder(true)} className="restore-button"><i className="fa-solid fa-circle-plus"></i> &nbsp;Folder</button>
                <button onClick={() => setEditing(true)} className="edit-button"><i className="fa-solid fa-square-pen"></i></button>
            </div>
        }
        {(!dek && bookmark.archived && !folderId && !teamId) && 
            <div className="button-container-two">
                <button onClick={() => setConfirmDelete(true)} className="archive-button"><i className="fa-solid fa-circle-xmark"></i> &nbsp; Delete</button>
                <button onClick={restore} className="restore-button"><i className="fa-solid fa-arrow-rotate-left"></i> &nbsp; Restore </button>
            </div>
        }
        </div>
        </>
    )
}