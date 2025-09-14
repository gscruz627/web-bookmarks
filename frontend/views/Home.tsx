import { Link } from "react-router-dom"
import { useSnapshot, type Snapshot } from "valtio";
import state from "../store"
export default function Home() {
    const snap: Snapshot<typeof state> = useSnapshot(state);
    const isAuth:boolean = snap.user?.userId !== null;
    return (
    <section>
        <nav style={{
            display:"flex",
            width:"100%",
            height:"100px",
            alignItems: "center",
            justifyContent: "space-between"
        }}>
            <Link to="/" style={{textDecoration: "none", color: "#262626"}}><h2>Web Bookmarks</h2></Link>
            <div>
                {isAuth ? 
                    <Link to="/dashboard"><button className="blue-button">Dashboard</button></Link>
                :
                    <Link to="/login"><button className="blue-button">Get Started</button></Link>
                }
            </div>
        </nav>
        
        <section style={{marginTop: "5rem"}}>
            <h1 style={{fontSize: "48px"}}>WEB BOOKMARKS</h1>
            <h3 style={{color: "#262626"}}>Bookmark Manager for the Web</h3>
            <div className="modal-half">
                <p>This Web Bookmarks manager will let you store any bookmarks on any device and browser,
                    you will be able to store any bookmark of any type. You can also create Folders and teams to share
                    bookmarks with other people, you can invite people to your team.
                    You can sort and search the bookmarks on any section.<br/>
                {isAuth ? 
                    <Link to="/dashboard"><button className="blue-button">See Your Dashboard</button></Link>
                :
                    <Link to="/login"><button className="blue-button">Get Started</button></Link>
                }
                </p>
                <img src="bookmarks.png"></img>
            </div>
            <h3 style={{margin: "2rem 0"}}>Images: </h3>
            <div className="modal-half">
                <img src="adding.png"></img>
                <img src="folders.png"></img>
            </div>
        </section>

        <footer style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#3b3b3b",
            margin: "2rem 0"
        }}>
            <a style={{textDecoration: "none", color: "#3b3b3b", fontWeight: "bold"}}  href="https://github.com/gscruz627/web-bookmarks"><i className="fa-brands fa-github"></i> See the Project </a>
            <p>
                Created by <a style={{textDecoration: "none", color: "#3b3b3b", fontWeight: "bold"}} href="https://gustavolacruz.com">Gustavo La Cruz</a>
            </p>
        </footer>
    </section>
  )
}
