import { Link } from "react-router-dom"
export default function Home() {
    const isAuth: boolean = Boolean(localStorage.getItem("access-token"));
    return (
    <section>
        <nav>
            <div>
            <Link to="/"><h3>Web Bookmarks</h3></Link>
            <a href="https://github.com/gscruz627">[GH] Github Repository</a>
            </div>
            {isAuth ? 
                <Link to="/dashboard"><button>Dashboard</button></Link>
             :
                <Link to="/login"><button>Get Started</button></Link>
            }
        </nav>
        
        <h1>Fancy title here </h1>
        <p>Some fancy features</p>
        {isAuth ? 
            <Link to="/dashboard"><button>Dashboard</button></Link>
        :
            <Link to="/login"><button>Get Started</button></Link>
        }
        <img src="?"></img>
        <h3>Features</h3>
        <ul>
            <li>features here...</li>
        </ul>

        <footer>
            <Link to="/"><h3>Web Bookmarks</h3></Link>
            <a href="https://gustavolacruz.com">Gustavo La Cruz</a>
        </footer>
    </section>
  )
}
