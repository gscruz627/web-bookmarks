import { DashboardSelection, MediaType } from "../enums"
import { useEffect, useRef, useState } from "react";
import useSortedBookmarks from "../hooks/useSortedBookmarks";
import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import checkAuth from "../functions/auth";
import { useNavigate } from "react-router-dom";
import NewBookmark from "../components/NewBookmark";
import FilterBox from "../components/FilterBox";
import Card from "../components/Card";

type Props = {}

export default function PrivateBookmarks({}: Props) {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const navigate = useNavigate();
    const [hasUnlocked, setHasUnlocked] = useState<boolean>(false);
    const [vaultInfo, setVaultInfo] = useState<any>(null);
    const [newBookmark, setNewBookmark] = useState<boolean>(false);
    const [mediaFilter, setMediaFilter] = useState<MediaType>(MediaType.None);
    const [loading, setLoading] = useState<boolean>(false);
    const [allBookmarks, setAllBookmarks] = useState<Array<any>>([]);
    const [error, setError] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const vaultPwdRef = useRef<HTMLInputElement>(null);
    const [vaultDek, setVaultDek] = useState<CryptoKey|undefined>(undefined);
    const [filter, setFilter] = useState<string>("Oldest to Newest (Added)");
    const [bookmarks, setBookmarks] = useState<Array<any>>([]);
    const [sectionTitle ,setSectionTitle] = useState<string>("");
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const sortedBookmarks = useSortedBookmarks(allBookmarks, filter, search, mediaFilter);
    
    async function loadVault(){
        await checkAuth(navigate);
        setLoading(true);
        try{
            const request = await fetch(`${SERVER_URL}/api/vaults`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`,
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
        } catch(error:any){
            setError(error.message)
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVault();
    }, [])
    function fromB64(b64: string): ArrayBuffer {
        const bin = atob(b64);
        const buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        return buf.buffer;
    }

    async function decryptBookmark(
      dek: CryptoKey,
      encrypted: { ciphertext: string; iv: string }
      ) {
        console.log(dek);
          const ciphertext = fromB64(encrypted.ciphertext);
          const iv = new Uint8Array(fromB64(encrypted.iv));
          const plaintextBuf = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            dek,
            ciphertext
          );
        return JSON.parse(new TextDecoder().decode(plaintextBuf));
       }

    async function loadBookmarks(){
        try{
            await checkAuth(navigate);
            setLoading(true);
            const request = await fetch(`${SERVER_URL}/api/private/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`
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
            setAllBookmarks(bookmarksDecrypted);
            setBookmarks(bookmarksDecrypted);
        } catch(errorMsg:any){
            setError(errorMsg.message);
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
            const salt = base64ToArrayBuffer(vaultInfo.kdfSalt);
            const iterations = vaultInfo.kdfIterations;
            console.log(vaultInfo.kdfHash);
            const hashAlg: AlgorithmIdentifier = {name: vaultInfo.kdfHash};
            console.log(hashAlg);
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
            const wrappedDEK = base64ToArrayBuffer(vaultInfo.wrappedDEK);
            const wrapIV = base64ToArrayBuffer(vaultInfo.wrapIV);
            
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
        } catch(error: any){
            if(error instanceof DOMException && error.name === "OperationError"){
                setError("Wrong Master Password");
            } else {
                console.error(error);
                setError("Something went wrong while unlocking your vault:" + error.message);
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
    function base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
    }
    function bufToBase64(buf) {
        return btoa(String.fromCharCode(...new Uint8Array(buf)));
    }
    
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
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`,
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    kdfSalt: bufToBase64(kdfSalt.buffer),
                    kdfIterations: kdfIterations,
                    kdfHash: kdfHash,
                    wrapIV: bufToBase64(wrapIV.buffer),
                    wrappedDEK: bufToBase64(wrappedDEK)
                })
            });
            if(!request.ok){
                const message = await request.json();
                setError(message);
                return;
            }
            const vault = await request.json();
            setVaultInfo(vault);
        } catch(error: any){
            setError(error.message);
        } finally{
            setLoading(false);
        }
    }
  
    return (
        <>
        {loading && <Loading/>}
        {newBookmark &&
            <NewBookmark onExit={() =>setNewBookmark(false)} onAdd={setAllBookmarks} dek={vaultDek}/>
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
                            <Card id={bookmark.id} dek={vaultDek} bookmark={bookmark} privateBookmark={true} id={bookmark.id} title={bookmark.title} baseSite={bookmark.baseSite} iconUrl={bookmark.iconURL ?? bookmark.iconUrl} mediaType={bookmark.mediaType}  archived={bookmark.archived} folders={bookmark.folders} key={bookmark.id} link={bookmark.link} onExit={() => loadBookmarks()} ></Card>
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