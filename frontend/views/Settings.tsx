import { useRef, useState } from "react";
import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import Confirm from "../components/Confirm";
import logout from "../functions/logout";
import { useSnapshot } from "valtio";
import state from "../store";
import checkAuth from "../functions/auth";


export default function Settings() {
  //@ts-ignore
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const snap = useSnapshot(state);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  
  const usernameRef=  useRef<HTMLInputElement>(null);

  async function changeName(e: React.FormEvent){
    e.preventDefault();
    if(usernameRef.current!.value === snap.user?.username){
      return;
    }
    setLoading(true);
    try{
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/users/${snap.user?.userId}`, {
        method: "PATCH",
        headers: {
          "Authorization" : `Bearer ${state.token}`,
          "Content-Type" : "application/json",
          "Accept" : "application/json"
        },
        body: JSON.stringify({
          username: usernameRef.current?.value || snap.user?.username
        })
      });
      const userResponse = await request.json();
      if(!request.ok){
        setError(userResponse);
        return;
      };
      state.user = userResponse;
    } catch(err: unknown){
      setError("Something went wrong: " + err)
    } finally{
      setLoading(false);
    }
  }

  async function deleteAccount(){
    setLoading(true);
    try{
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/users/${snap.user?.userId}`, {
        method: "DELETE",
        headers: {
          "Authorization" : `Bearer ${state.token}`,
        }
      })
      if(!request.ok){
        const message = await request.json();
        setError(message);
      return;
      }
      logout(navigate)
    } catch(err: unknown){
      setError("Something went wrong: " + err)
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
              <input style={{width: "100%"}} ref={usernameRef} type="text" defaultValue={snap.user?.username ?? ""}/>
            
              <button type="button" onClick={() => setConfirmDelete(true)} style={{backgroundColor: "#a31b1bff"}}>Delete my Account</button><br/>
              <button type="submit">Save changes.</button>

            </form>
          </div>
        </div>
      </div>
    </>
  )
}