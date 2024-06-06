import messageCSS from "./message.module.css"
import { Allconvers } from "../context api/context"
import { Chatcontext } from "../context api/chatcontext"
import { useContext } from "react"
export const Message=({message})=>{
    
    const {currentUser}=useContext(Allconvers)
    const {data}=useContext(Chatcontext)
    return(
        <div className={messageCSS.message}>
            <div className={messageCSS.messageinfo}>
                <img src={message?.image} alt="" className={messageCSS.img}/>
                <span className={messageCSS.date}>{message?.date}</span>
            </div>
            <div className={messageCSS.messagecontent}>
                <p className={messageCSS.content}>{message?.text}</p>
            </div>
        </div>
    )
}