import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'

// Import CSS
import './App.css'
import '../styles/dashboard.css'
import '../styles/buttons.css'
import '../styles/add-box.css'
import '../styles/boxes.css'
import '../styles/card.css'
import '../styles/dashboard.css'
import '../styles/modal.css'

// Import Routes
import state from '../store'
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

  // Setup Valtio => Snapshot and rehydration.
  const snap = useSnapshot(state);
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    // Get permanent saves
    const savedToken = localStorage.getItem("access-token");
    const savedRefresh = localStorage.getItem("refresh-token");
    const savedUser = localStorage.getItem("user");
    const savedTheme = localStorage.getItem("theme");

    // If there are permanent saves, setup Valtio to use them.
    state.theme = savedTheme === "dark" ? "dark" : "light";
    if (savedToken) state.token = savedToken;
    if (savedRefresh) state.refreshToken = savedRefresh;
    if (savedUser) state.user = JSON.parse(savedUser);

    // Apply theme immediately
    document.body.classList.remove("light", "dark");
    document.body.classList.add(state.theme);

    setRehydrated(true);
}, []);
  
  if (!rehydrated) return null;
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={snap.token ? <Bookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/archived" element={snap.token ? <ArchivedBookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/folders/:id" element={snap.token ? <FolderBookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/private" element={snap.token ? <PrivateBookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/teams/:id" element={snap.token ? <TeamBookmarks/> : <Navigate to="/login"/>}/>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/settings" element={snap.token ? <Settings/> : <Navigate to="/login"/>}/>
        <Route path="/join/:id" element={<Join/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
