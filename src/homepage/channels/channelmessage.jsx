import channelmessageCSS from "./channelmessage.module.css";
import { Allconvers } from "../../context api/context";
import { Chatcontext } from "../../context api/chatcontext";
import { useContext, useState } from "react";
import { Getuserdetails } from "../../database";
export const ChannelMessage = ({ message }) => {
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
  return (
    <div className={channelmessageCSS.message}>
      <div className={channelmessageCSS.sender}>
        <img src={senderimg} alt="" className={channelmessageCSS.senderimg} />
        <span className={channelmessageCSS.sendername}>{senderusername}</span>
      </div>
      <div className={channelmessageCSS.messageinfo}>
        <img src={message?.image} alt="" className={channelmessageCSS.img} />
        <span className={channelmessageCSS.date}>{message?.date}</span>
      </div>
      <div className={channelmessageCSS.messagecontent}>
        <p className={channelmessageCSS.content}>{message?.text}</p>
      </div>
    </div>
  );
};
