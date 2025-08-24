import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from "../views/Home"
import Bookmarks from "../views/Bookmarks"
import Login from "../views/Login"
import Register from "../views/Register"
import ArchivedBookmarks from "../views/ArchivedBookmarks"
import FolderBookmarks from "../views/FolderBookmarks"
import TeamBookmarks from "../views/TeamsBookmarks"
import PrivateBookmarks from "../views/PrivateBookmarks"
import Settings from "../views/Settings"
import Join from "../components/Join"

function App() {
  const isAuth = localStorage.getItem("access-token");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={isAuth ? <Bookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/archived" element={isAuth ? <ArchivedBookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/folders/:id" element={isAuth ? <FolderBookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/private" element={isAuth ? <PrivateBookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/teams/:id" element={isAuth ? <TeamBookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/settings" element={isAuth ? <Settings/> : <Navigate to="/login"/>}/>
        <Route path="/join/:id" element={isAuth ? <Join/> : <Navigate to="/login/:teamId"/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
