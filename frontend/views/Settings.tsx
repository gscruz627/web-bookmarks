import { useRef, useState } from "react";
import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import Confirm from "../components/Confirm";
import logout from "../functions/logout";

type Props = {}

export default function Settings({}: Props) {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const usernameRef=  useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  async function changeName(e: React.FormEvent){
    e.preventDefault();
    if(usernameRef.current!.value === localStorage.getItem("username")){
      return;
    }
    setLoading(true);
    try{
      const request = await fetch(`${SERVER_URL}/api/users/${localStorage.getItem("userId")}`, {
        method: "PATCH",
        headers: {
          "Authorization" : `Bearer ${localStorage.getItem("access-token")}`,
          "Content-Type" : "application/json",
          "Accept" : "application/json"
        },
        body: JSON.stringify({
          username: usernameRef.current?.value || localStorage.getItem("username")
        })
      });
      if(!request.ok){
        setError("Something wrong happened while changing your name " + request.status);
      }
      const userResponse = await request.json();
      localStorage.setItem("username", userResponse.username);
      //window.location.reload();
    } catch(error: any){
      setError("Server error: " + error.message);
    } finally{
      setLoading(false);
    }
  }

  async function deleteAccount(){
    setLoading(true);
    try{
      const request = await fetch(`${SERVER_URL}/api/users/${localStorage.getItem("userId")}`, {
        method: "DELETE",
        headers: {
          "Authorization" : `Bearer ${localStorage.getItem("access-token")}`,
        }
      })
      if(!request.ok){
        setError("Something went wrong while deleting your account, status: " + request.status);
      }
      logout(navigate)
    } catch(error: any){
      setError("Server error: " + error.message);
    } finally{
      setLoading(false);
    }
  }
  return (
    <>
      {loading && <Loading/>}

      {confirmDelete && <Confirm onExit={() => setConfirmDelete(false)} next={() => deleteAccount()} typeText="Account"/>}

      <div id="dashboard">
        <Sidebar/>

        <div id="dashboard-body">
          {error && <div className="error-box">{error}</div>}
          <div className="center-box">
            <h2>Account Settings</h2>
            <form onSubmit={changeName}>
              <label  htmlFor="username">Username:</label>
              <input style={{width: "100%"}} ref={usernameRef} type="text" defaultValue={localStorage.getItem("username") ?? ""}/>
            
              <button type="button" onClick={() => setConfirmDelete(true)} style={{backgroundColor: "#a31b1bff"}}>Delete my Account</button><br/>
              <button type="submit">Save changes.</button>

            </form>
          </div>
        </div>
      </div>
    </>
  )
}