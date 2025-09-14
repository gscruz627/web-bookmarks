import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import checkAuth from "../functions/auth";
import Loading from "./Loading";
import state from "../store";
import { encryptBookmark, decryptBookmark } from "../functions/vault";

type Props = {
  onExit: () => void;
  teamId?: string;
  dek?: CryptoKey
}

export default function NewBookmark({onExit, teamId, dek}: Props) {

  //@ts-ignore
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
      const request = await fetch(`${SERVER_URL}/api/searches?query=${linkRef.current!.value}`);
      if(!request.ok){
        setError("A connection to that site was unsuccessful. The site may be blocking this request. Fill out the fields manually.")
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
    } catch(error: unknown){
      setError(`A connection to that site was unsuccessful. The site may be blocking this request. Fill out the fields manually.`)
    } finally{
      setLoading(false);
    }
  }
  async function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    try{
      setLoading(true);
      await checkAuth(navigate);
      let route = SERVER_URL + "/api/";
      route += dek ? "private" : "bookmarks";
      console.log(dek);
      console.log({
        "iconUrl": iconRef.current!.src,
        "title": titleRef.current?.value,
        "link" : linkRef.current?.value,
        "baseSite": websiteRef.current?.value,
        "mediaType": mediaSelectionRef.current?.value,
        "teamId" : teamId ?? null
      })
      const requestBody = dek ? await encryptBookmark(dek, {
        "iconURL": iconRef.current!.src,
        "title": titleRef.current!!.value,
        "link" : linkRef.current!.value,
        "baseSite": websiteRef.current!.value,
        "mediaType": mediaSelectionRef.current!.value,
        "teamId" : teamId ?? undefined
      }) : {
        "iconUrl": iconRef.current!.src,
        "title": titleRef.current?.value,
        "link" : linkRef.current?.value,
        "baseSite": websiteRef.current?.value,
        "mediaType": mediaSelectionRef.current?.value,
        "teamId" : teamId ?? null
      }
      console.log(requestBody)
      const request = await fetch(route, {
          method: "POST",
          headers: {
            "Content-Type" : "application/json",
            "Accept" : "application/json",
            "Authorization" : `Bearer ${state.token}`
          },
          body: JSON.stringify(requestBody)
        })
        const bookmarkInfo = await request.json();
        if(!request.ok){
          setError(bookmarkInfo);
          return;
        }
        const bookmark = dek ? await decryptBookmark(dek, {ciphertext: bookmarkInfo.cipher, iv: bookmarkInfo.iv}) : bookmarkInfo
        state.bookmarks.push(bookmark);
        setError("");
        onExit();
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
        <h2>New Bookmark {teamId && " For Team"}</h2>
        <a role="button" onClick={onExit}>Cancel</a>
        {error && <div className="error-box">{error} <span onClick={() => setError("")}>X</span></div>}
        <label htmlFor="title">Title: </label>
        <input type="text" name="title" id="title" ref={titleRef} required/>
        <label htmlFor="link">Link: </label>
        <input type="text" name="link" id="link" ref={linkRef} required/>

        <button type="button" onClick={retrieveWebsiteData}>Retrieve Link data (ie. thumbnail)</button>
        <label htmlFor="website">Website:</label>
        <input type="text" name="website" id="website" ref={websiteRef}/>
        <img ref={iconRef}></img>
        <label htmlFor="mediaSelection">Media Type:</label>
        <select ref={mediaSelectionRef} name="mediaSelection" id="mediaSelection">
          <option value="Video">Video</option>
          <option value="Post">Post</option>
          <option value="Document">Document</option>
          <option value="Image">Image</option>
        </select>

        <button type="submit">Add</button>
      </form>
    </div>
    </>
  )
}