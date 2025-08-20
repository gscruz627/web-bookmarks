import { DashboardSelection } from "../enums"
import { useState } from "react";

type Props = {}

export default function PrivateBookmarks({}: Props) {
    const [hasUnlocked, setHasUnlocked] = useState<boolean>(false);

    function handleVaultSubmit(){
        alert('unlocked');
    }
  
    return (
        <>
        {hasUnlocked ?
             <p>Hello wold</p>
        :
        <div className="center-box">
            <form onSubmit={handleVaultSubmit}>
                <h3>Unlock your vault first</h3>
                <label htmlFor="vaultPwd">Passphrase: </label>
                <input type="text" name="vaultPwd" id="vaultPwd" style={{width: "100%"}}/>
                <button type="submit">Access</button>
            </form>
        </div>
        }
        </>
    );
}