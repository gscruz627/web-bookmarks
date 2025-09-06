import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'

function App() {

  const snap = useSnapshot(state);
  const [rehydrated, setRehydrated] = useState(false);
  useEffect(() => {
    const savedToken = localStorage.getItem('access-token');
    const savedRefresh = localStorage.getItem('refresh-token');
    const savedUser = localStorage.getItem('user');

    if (savedToken) state.token = savedToken;
    if (savedRefresh) state.refreshToken = savedRefresh;
    if (savedUser) state.user = JSON.parse(savedUser);
    setRehydrated(true); // mark as ready after hydration
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
        <Route path="/join/:id" element={snap.token ? <Join/> : <Navigate to="/login/:teamId"/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
