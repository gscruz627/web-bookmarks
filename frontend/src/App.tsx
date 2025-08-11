import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "../views/Home"
import Bookmarks from "../views/Bookmarks"
import Login from "../views/Login"
import Register from "../views/Register"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={<Bookmarks/>}/>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
