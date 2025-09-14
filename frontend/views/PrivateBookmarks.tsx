import { MediaType, type BookmarkInfoDTO, type VaultInfoDTO } from "../enums"
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";

import useSortedBookmarks from "../hooks/useSortedBookmarks";
import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import checkAuth from "../functions/auth";
import NewBookmark from "../components/NewBookmark";
import FilterBox from "../components/FilterBox";
import Card from "../components/Card";
import state from "../store";

import {decryptBookmark, base64ToArrayBuffer, toB64} from "../functions/vault"

export default function PrivateBookmarks() {
    // @ts-ignore
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const snap = useSnapshot(state);
    const navigate = useNavigate();
 
    const [hasUnlocked, setHasUnlocked] = useState<boolean>(false);
    const [vaultInfo, setVaultInfo] = useState<VaultInfoDTO | null>(null);
    const [newBookmark, setNewBookmark] = useState<boolean>(false);
    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const vaultPwdRef = useRef<HTMLInputElement>(null);
    const [vaultDek, setVaultDek] = useState<CryptoKey|undefined>(undefined);
    const [filter, setFilter] = useState<string>("Oldest to Newest (Added)");

    const sortedBookmarks = useSortedBookmarks(snap.bookmarks as Array<BookmarkInfoDTO>, filter, search, mediaFilter);
    
    async function loadVault(){
        setLoading(true);
        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/vaults`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${state.token}`,
                    "Content-Type" : "application/json"
                }
            });
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
            }
            const result = await request.json();
            if(!result.doesNotHaveVault){
                setVaultInfo(result)
            }
        } catch(err: unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVault();
    }, [])

    async function loadBookmarks(){
        try{
            await checkAuth(navigate);
            setLoading(true);
            const request = await fetch(`${SERVER_URL}/api/private/`, {
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
            const bookmarksDecrypted = new Array();
            for(let bookmarkEncrypted of bookmarksResponse){
                const decrypted = await decryptBookmark(vaultDek!, {ciphertext: bookmarkEncrypted.cipher, iv: bookmarkEncrypted.iv})
                decrypted.id = bookmarkEncrypted.id
                bookmarksDecrypted.push(decrypted);
            }
            state.bookmarks = bookmarksDecrypted;
        } catch(err: unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }
    }

    async function handleVaultSubmit(e: React.FormEvent){
        setLoading(true);
        try{
            e.preventDefault();
            const pwKey = await crypto.subtle.importKey(
                "raw",
                new TextEncoder().encode(vaultPwdRef.current?.value),
                { name: "PBKDF2"},
                false,
                ["deriveKey"]
            );
            const salt = base64ToArrayBuffer(vaultInfo!.kdfSalt);
            const iterations = vaultInfo?.kdfIterations;
            const hashAlg: AlgorithmIdentifier = {name: vaultInfo!.kdfHash};
            const kek = await crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: salt,
                    iterations: iterations,
                    hash: hashAlg
                },
                pwKey,
                {name: "AES-GCM", length: 256},
                false,
                ["encrypt", "decrypt"]
            );
            const wrappedDEK = base64ToArrayBuffer(vaultInfo!.wrappedDEK);
            const wrapIV = base64ToArrayBuffer(vaultInfo!.wrapIV);
            
            const rawDEK = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: wrapIV},
                kek,
                wrappedDEK
            );
            const dek = await crypto.subtle.importKey(
                "raw",
                rawDEK,
                { name: "AES-GCM" },
                false,
                ["encrypt", "decrypt"]
            );
            setError("");
            setVaultDek(dek);
            setHasUnlocked(true);
        } catch(error: unknown){
            if(error instanceof DOMException && error.name === "OperationError"){
                setError("Wrong Master Password");
            } else {
                console.error(error);
                setError("Something went wrong while unlocking your vault:" + error);
            }
        } finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        if(vaultDek){
            loadBookmarks();
        }
    }, [vaultDek])
    
    async function handleCreateVault(e: React.FormEvent){
        setLoading(true);
        // logic behind creating vault
        e.preventDefault();
        // This is a 32 byte Salt
        const kdfSalt = crypto.getRandomValues(new Uint8Array(32));
        // KDF Parameters
        const kdfIterations = 1_000_000;
        const kdfHash = "SHA-256";

        // Derive Key Encryption Key (KEK)
        const pwdKey = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(vaultPwdRef.current?.value),
            { 
                name: "PBKDF2"
            },
            false,
            ["deriveKey"]
        )

        const KEK = await crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: kdfSalt, iterations: kdfIterations, hash: kdfHash},
            pwdKey,
            {name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        )

        // Generate Data Encryption Key (DEK)
        const DEK = await crypto.subtle.generateKey(
            {name: "AES-GCM", length: 256 },
            true,
            ["decrypt", "encrypt"]
        )

        // Wrap DEK with KEK
        const rawDEK = await crypto.subtle.exportKey("raw", DEK);
        const wrapIV = crypto.getRandomValues(new Uint8Array(12));
        const wrappedDEK = await crypto.subtle.encrypt(
            {name: "AES-GCM", iv: wrapIV},
            KEK,
            rawDEK
        )

        // Send data to Server
        await checkAuth(navigate);
        try{
            const request = await fetch(`${SERVER_URL}/api/vaults`, {
                method: "POST",
                headers: {
                    "Authorization" : `Bearer ${state.token}`,
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    kdfSalt: toB64(kdfSalt.buffer),
                    kdfIterations: kdfIterations,
                    kdfHash: kdfHash,
                    wrapIV: toB64(wrapIV.buffer),
                    wrappedDEK: toB64(wrappedDEK)
                })
            });
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
            }
            const vault = await request.json();
            setVaultInfo(vault);
        } catch(err: unknown){
            setError("Something went wrong: " + err)
        } finally{
            setLoading(false);
        }
    }
  
    return (
        <>
        {loading && <Loading/>}
        {newBookmark &&
            <NewBookmark onExit={() =>setNewBookmark(false)} dek={vaultDek}/>
        }
        <div id="dashboard">
            <Sidebar/>

            <div id="dashboard-body">
                {error && <div className="error-box">{error}</div>}
                {hasUnlocked &&
                <>
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
                            <Card key={bookmark.id} dek={vaultDek} bookmark={bookmark}></Card>
                        ))
                    }
                </div>
                </>
                }
                {(vaultInfo && !hasUnlocked) && 
                    <div className="center-box">
                        <form onSubmit={handleVaultSubmit}>
                            <h3>Unlock your vault first</h3>
                            <label htmlFor="vaultPwd">Passphrase: </label>
                            <input ref={vaultPwdRef} type="password" name="vaultPwd" id="vaultPwd" style={{width: "100%"}}/>
                            <button type="submit">Access</button>
                        </form>
                    </div>
                }
                {!vaultInfo  && 
                    <div className="center-box">
                        <form onSubmit={handleCreateVault}>
                            <h3>Create your Private Vault</h3>
                            <label htmlFor="vaultPwd">Master Passphrase: </label>
                            <input ref={vaultPwdRef} type="password" name="vaultPwd" id="vaultPwd" style={{width: "100%"}}/>
                            <button type="submit">Create</button>
                        </form>
                    </div>
                }

            </div>
        </div>
        
        </>
    );
}