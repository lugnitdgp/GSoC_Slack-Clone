import messageCSS from "./message.module.css";
import { Allconvers } from "../context api/context";
import { Chatcontext } from "../context api/chatcontext";
import { useContext, useState } from "react";
import { Getuserdetails } from "../database";
export const Message = ({ message }) => {
  const { currentUser } = useContext(Allconvers);
  const { data } = useContext(Chatcontext);
  const [senderusername,setSenderusername]=useState('')
  const [senderimg,setSenderimg]=useState('')
  const sender = Getuserdetails(message?.senderId);
  sender.then((data) => {
    if (Array.isArray(data) && data.length > 0) {   //here we are getting a promise as the data
      const username = data[0].username; // Check if data is an array and has elements
      const sendimg = data[0]?.avatar_url;// Access the username from the first element
      setSenderimg(sendimg)
      setSenderusername(username)
    } else {
      console.log("No data or invalid format");
    }
  });

  console.log(sender.Promise);
  return (
    <div className={messageCSS.message}>
      <div className={messageCSS.sender}>
        <img src={senderimg} alt="" className={messageCSS.senderimg} />
        <span className={messageCSS.sendername}>{senderusername}</span>
      </div>
      <div className={messageCSS.messageinfo}>
        <img src={message?.image} alt="" className={messageCSS.img} />
        <span className={messageCSS.date}>{message?.date}</span>
      </div>
      <div className={messageCSS.messagecontent}>
        <p className={messageCSS.content}>{message?.text}</p>
      </div>
    </div>
  );
};
