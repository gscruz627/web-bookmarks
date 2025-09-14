type Props = {
    handleNameChange: (e: React.FormEvent) => void
    titleRef: React.Ref<HTMLInputElement>
    onExit: () => void
    error: string
}

export default function EditTitle({titleRef, handleNameChange, onExit, error}: Props) {
    return (
        <>
        <div className="modal-box">
            <form onSubmit={(e) => handleNameChange(e)}>
                <h2>Edit name: </h2>
                <a role="button" onClick={onExit}>Cancel</a>
                {error && <div className="error-box">{error}</div>}
                <label htmlFor="title">New Title: </label>
                <input type="text" name="title" id="title" ref={titleRef} required></input>
                <button type="submit">Save Changes</button>
            </form>
        </div>
        </>
    )
}