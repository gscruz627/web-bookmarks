import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import state from '../store';

type Props = {}

export default function Join({}: Props) {
    const { id } = useParams();
    const navigate = useNavigate();
    async function joinTeam(){
        //@ts-ignore
        const SERVER_URL = import.meta.env.VITE_SERVER_URL;
        try{
            const request = await fetch(`${SERVER_URL}/api/teams/${id}/members`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${state.token}`
                }
            });
            if(!request.ok){
                alert("Something went wrong while adding you to this team, error code: " + request.statusText);
            }
            navigate(`/teams/${id}`)
        } catch(err:unknown){
            alert("Something went wrong: " + err)
        }
    }

    useEffect( () => {
        if(!state.token){
            navigate(`/login?refTeamId=${id}`)
            return;
        }
        joinTeam();
    }, [])

    return (
        <div className="center-box">
            <h3>Joining your Team...</h3>
            <p>Please wait.</p>
        </div>
    )
}