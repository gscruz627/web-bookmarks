import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import checkAuth from "../functions/auth";
import Loading from "./Loading";
import state from "../store";
import {decryptBookmark, encryptBookmark} from "../functions/vault"
import type { BookmarkInfoDTO } from "../enums";
type Props = {
  onExit: () => void;
  cardInfo: BookmarkInfoDTO;
  dek?: CryptoKey
}

export default function EditBookmark({cardInfo,onExit, dek}: Props) {
  // @ts-ignore
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();

  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const mediaSelectionRef = useRef<HTMLSelectElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);


  function normalizeUrl(input: string) {
    if (!/^https?:\/\//i.test(input)) {
      input = "https://" + input;
    }
    try {
      return new URL(input).href;
    } catch (e) {
      setError(`Invalid URL: ${input}`);
      return null;
    }
  }
  async function retrieveWebsiteData(){
    try{
      setLoading(true);
      linkRef.current!.value = normalizeUrl(linkRef.current!.value) || linkRef.current!.value;
      const request = await fetch(`${SERVER_URL}/api/searchers/?query=${linkRef.current!.value}`);
      if(!request.ok){
       setError(`A connection to that site was unsuccessful. The site may be blocking this request. Fill out the fields manually.`)
      }
      const html = await request.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute("content");
      if(ogSiteName) websiteRef.current!.value = ogSiteName;
      else {
        const title = doc.querySelector("title")?.innerText;
        if(title) websiteRef.current!.value = title;
        else {
          const hostname = new URL(linkRef.current!.value).hostname;
          const parts = hostname.split(".");
          const core = parts.length > 2 ? parts[parts.length - 2] : parts[0];
          const fallbacksitename = core.charAt(0).toUpperCase() + core.slice(1);
          websiteRef.current!.value = fallbacksitename;
        }
      }

      // Get the Icon of the website
      const icoUrl = new URL(doc.querySelector('link[rel="icon"]')?.getAttribute("href")!, linkRef.current!.value);
      iconRef.current!.src = icoUrl.toString() || "";
      setError("");
    } catch(err: unknown){
      setError("Something went wrong: " + err)
    } finally{
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    try{
      setLoading(true);
      await checkAuth(navigate);
      let route = `${SERVER_URL}/api/`
      route += dek ? `private/${cardInfo.id}` : `bookmarks/${cardInfo.id}` 
      const request = await fetch(route, {
          method: dek ? "PUT" : "PATCH",
          headers: {
            "Content-Type" : "application/json",
            "Accept" : "application/json",
            "Authorization" : `Bearer ${state.token}`
          },
          body: dek ? JSON.stringify(await encryptBookmark(dek,{
            "iconURL": iconRef.current!.src == "" ? cardInfo.iconURL : iconRef.current!.src,
            "title": titleRef.current!.value,
            "link" : linkRef.current!.value,
            "baseSite": websiteRef.current!.value,
            "mediaType": mediaSelectionRef.current!.value,
          })) : JSON.stringify({
            "iconUrl": iconRef.current!.src == "" ? cardInfo.iconURL : iconRef.current!.src,
            "title": titleRef.current?.value,
            "link" : linkRef.current?.value,
            "baseSite": websiteRef.current?.value,
            "mediaType": mediaSelectionRef.current?.value,
          })
        })
        setError("");
        if(!request.ok){
          const message = await request.json();
          setError(message);
          return;
        }
        const bookmark = await request.json();
        const decryptedBookmark = dek ? await decryptBookmark(dek!, {ciphertext: bookmark.cipher, iv: bookmark.iv}) : bookmark;
        state.bookmarks = state.bookmarks.map( b => b.id === cardInfo.id ? decryptedBookmark : b);
        onExit?.();
      }
      catch(err: unknown){
        setError("Something went wrong: " + err)
      } finally{
        setLoading(false)
      }
    }

  return (
    <>
    {loading && <Loading/>}
    <div className="modal-box">
      <form onSubmit={handleSubmit}>
        <h2>Edit Bookmark</h2>
        <a role="button" onClick={onExit}>Cancel</a>
        {error && <div className="error-box">{error} <span onClick={() => setError("")}>X</span></div>}
        <label htmlFor="title">Title: </label>
        <input type="text" name="title" id="title" ref={titleRef} defaultValue={cardInfo.title} required/>
        <label htmlFor="link">Link: </label>
        <input type="text" name="link" id="link" ref={linkRef} defaultValue={cardInfo.link} required/>

        <button type="button" onClick={retrieveWebsiteData}>Retrieve Link data (ie. thumbnail)</button>
        <label htmlFor="website">Website:</label>
        <input type="text" name="website" id="website" defaultValue={cardInfo.baseSite} ref={websiteRef}/>
        <img ref={iconRef} src={cardInfo.iconURL}></img>
        <label htmlFor="mediaSelection">Media Type:</label>
        <select ref={mediaSelectionRef} name="mediaSelection" id="mediaSelection" defaultValue={cardInfo.mediaType}>
          <option value="Video">Video</option>
          <option value="Post">Post</option>
          <option value="Document">Document</option>
          <option value="Image">Image</option>
        </select>

        <button type="submit">Confirm</button>
      </form>
    </div>
    </>
  )
}