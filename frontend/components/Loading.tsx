export default function Loading() {
  return (
    <div
    style={{
        position:"fixed",
        top:"0",
        left:"0",
        width:"100vw",
        height:"100vh",
        backgroundColor:"rgba(0,0,0,0.5)",
        flexWrap:"wrap",
        zIndex:9999,
        color: "#FFF",
        display:"flex",
        fontWeight: "bolder",
        justifyContent:"center",
        alignContent:"center",
        margin:"auto auto"
    }}><p>Loading... Please Wait.</p></div>
  )
}