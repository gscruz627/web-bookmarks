type Props = {
    next: () => void,
    typeText: string,
    onExit: () => void
}

export default function Confirm({next, typeText, onExit}: Props) {
    return (
        <>
        <div className="modal-box">
            <form onSubmit={(e) => e.preventDefault()}>
                <h2>Are you sure you want to 
                    {typeText === "Leave" && "leave this Team?"}
                    {typeText === "Account" && "delete your account?"}
                    {(!["Leave","Account"].includes(typeText)) && `delete this ${typeText}`}
                </h2>
                <button onClick={onExit} style={{backgroundColor: "#971717"}}>Cancel</button>
                <button onClick={next}>Confirm</button>
            </form>
        </div>
        </>
    )
}