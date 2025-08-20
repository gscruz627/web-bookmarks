import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "../views/Home"
import Bookmarks from "../views/Bookmarks"
import Login from "../views/Login"
import Register from "../views/Register"
import ArchivedBookmarks from "../views/ArchivedBookmarks"
import FolderBookmarks from "../views/FolderBookmarks"
import TeamBookmarks from "../views/TeamsBookmarks"
import PrivateBookmarks from "../views/PrivateBookmarks"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={<Bookmarks/>}/>
        <Route path="/archived" element={<ArchivedBookmarks/>}/>
        <Route path="/folders/{id}" element={<FolderBookmarks/>}/>
        <Route path="/private" element={<PrivateBookmarks/>}/>
        <Route path="/team/{id}" element={<TeamBookmarks/>}/>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
