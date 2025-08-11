import {MediaType} from "../enums"
import "../styles/Card.css"
interface props{
    iconUrl: string,
    title: string,
    link: string,
    folders: Array<string>
    baseSite: string,
    mediaType: MediaType,
    mediaUrl?: string | null,
    archived?: boolean
}
export default function Card({baseSite, title, iconUrl, folders, link, mediaType, mediaUrl, archived}: props) {

    return (
        <div>
        <a href={link} style={{textDecoration:"none", color: "black"}}>
            <div id="card">
                <div>
                    <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F0%2F09%2FYouTube_full-color_icon_(2017).svg%2F2560px-YouTube_full-color_icon_(2017).svg.png&f=1&nofb=1&ipt=a7f13e354644a2fc68fbc00c468d66e530a493f3eb37ac473d8a5a836c854432"></img>
                    <h4>{baseSite}</h4>
                </div>
                <p>{title}</p>
                <div>
                    <span>{mediaType}</span>
                    {folders.map( (folder) => (
                        <span>{folder}</span>
                    ))}
                </div>
                {mediaUrl ? 
                    <img src={mediaUrl}></img>
                : 
                    <div className="image-placeholder">
                        {mediaType === MediaType.Document && <i className="fa-solid fa-file"></i>}
                        {mediaType === MediaType.Image && <i className="fa-regular fa-image"></i>}
                        {mediaType === MediaType.Video && <i className="fa-solid fa-file-video"></i>}
                        {mediaType === MediaType.Post && <i className="fa-solid fa-comments"></i>}
                    </div>
                }
            </div>
        </a>
        {!archived ? 
            <button className="archive-button"><i className="fa-solid fa-trash-can"/> &nbsp; Archive</button>
        :
            <div className="button-container-two">
                <button className="archive-button"><i className="fa-solid fa-circle-xmark"></i> &nbsp; Delete</button>
                <button className="restore-button"><i className="fa-solid fa-arrow-rotate-left"></i> &nbsp; Restore </button>
            </div>
        }
        </div>
    )
}