import messageCSS from "./message.module.css";
import { Allconvers } from "../../context api/context";
import { Chatcontext } from "../../context api/chatcontext";
import { useContext, useState, useEffect } from "react";
import { Getuserdetails, fetchUsermessages } from "../../database";
import { RiChatDeleteLine } from "react-icons/ri";
import supabase from "../../supabase";
export const Message = ({ message }) => {
  const { currentUser } = useContext(Allconvers);
  const { data } = useContext(Chatcontext);
  const [senderusername, setSenderusername] = useState("");
  const [messages, setMessages] = useState([]);
  const [senderimg, setSenderimg] = useState("");
  const [msgupdate, setMsgupdate] = useState(false);
  const sender = Getuserdetails(message?.senderId);
  sender.then((data) => {
    if (Array.isArray(data) && data.length > 0) {
      //here we are getting a promise as the data
      const username = data[0].username; // Check if data is an array and has elements
      const sendimg = data[0]?.avatar_url; // Access the username from the first element
      setSenderimg(sendimg);
      setSenderusername(username);
    } else {
      console.log("No data or invalid format");
    }
  });
  /* useEffect(() => {
    const fetchmessages = async () => {
      const messagesuptained = await fetchUsermessages(data.chatId);
      if (messagesuptained) {
        setMessages(messagesuptained);
      }
    };
    fetchmessages();
  }, [data.chatId]);
  useEffect(() => {
    const fetchmessages = async () => {
      if (msgupdate) {
        const messagesuptained = await fetchUsermessages(data.chatId);
        if (messagesuptained) {
          setMessages(messagesuptained);
          setMsgupdate(false);
        }
      }
    };
    fetchmessages();
  }, [msgupdate]);

  useEffect(() => {
    const message = () => {
      console.log(msgupdate);

      const chatsDm = supabase
        .channel("custommsgfetch")
        .on(
          "postgres_changes",
          {
            event: "*", //channels are used to listen to real time changes
            schema: "public", //here we listen to the changes in realtime and update the postgres changes here
            table: "chats_dm",
            select: "messages",
            filter: `id=eq.${data.chatId}`,
          },
          (payload) => {
            setMsgupdate(true);
          }
        )
        .subscribe();

      // Cleanup function to unsubscribe from the channel to avoid data leakage
      return () => {
        supabase.removeChannel(chatsDm);
      };
    };
    message();
  }, [data.chatId]);

  const deletemsg = async (id) => {
    const updatedMessages = messages.filter((msg) => msg.id !== id);
    try {
      const { data: updatedData, error } = await supabase
        .from("chats_dm")
        .update({
          messages: updatedMessages,
        })
        .eq("id", data.chatId);

      if (error) {
        throw new Error(error.message);
      }

      setMessages(updatedData);
    } catch (error) {
      console.error("Error deleting message:", error.message);
    }
  };*/
  return (
    <div className={messageCSS.message}>
      <div className={messageCSS.sender}>
        <img src={senderimg} alt="" className={messageCSS.senderimg} />
        <span className={messageCSS.sendername}>{senderusername}</span>
        {/* <RiChatDeleteLine
          style={{ cursor: "pointer" }}
          onClick={() => deletemsg(message.id)}
  />*/}
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
