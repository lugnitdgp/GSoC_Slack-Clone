import ChatsCSS from "./chats.module.css";
import { useContext, useEffect, useState } from "react";
import { Chatcontext } from "../context api/chatcontext";
import supabase from "../supabase.jsx";
import { IoMdAttach } from "react-icons/io";
import { Message } from "./message.jsx";
import { Allconvers } from "../context api/context.jsx";
import {v4 as uuid} from "uuid"
import { fetchUsermessages } from "../database.jsx";

export const Chats = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const { data } = useContext(Chatcontext);
  const { currentUser } = useContext(Allconvers);
  const [messages, setMessages] = useState([]);

  console.log(currentUser[0].id)
  console.log(data.chatId);
useEffect(()=>{
    const fetchmessages = async () => {
        const messagesuptained=await fetchUsermessages(data.chatId)
        if(messagesuptained){
            console.log("messages",messagesuptained)
            setMessages(messagesuptained)
        }
    }
    fetchmessages()
},[data.chatId])
  useEffect(()=>{
    console.log("recieved msgs:",messages)
  },[messages])
  useEffect(() => {
    const messages = () => {
      const chatsDm = supabase
        .channel("custom-filter-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chats_dm",
            select: "messages",
            filter: `id=eq.${data.chatId}`,
          },
          (payload) => {
            console.log("Change received!", payload);
            setMessages((prevmessages) => {
              const updatedmessages = [...prevmessages, payload.new];
              console.log(messages);
              return updatedmessages;
            });
          }
        )
        .subscribe();

      // Cleanup function to unsubscribe from the channel
      return () => {
        supabase.removeChannel(chatsDm);
      };
    };
    messages();
  }, [data.chatId]);

  const handlesend= async()=>{
    if(img){

    }
    else{

const { data, error } = await supabase
.from('chats_dm')
.update({ 
    messages: [
        ...messages,
        {
          id:uuid,
          text:text,
          senderId:currentUser[0].id,
          date:new Date().toISOString()
        },
      ],
 })
.eq('id', data.chatId)
.select()

    }
  }
  console.log(messages);
  return (
    <div className={ChatsCSS.chat}>
      <div className={ChatsCSS.chatinfo}>
        <span>{data?.user.uusername}</span>
      </div>
      <div className={ChatsCSS.messages}>
        {messages.map((m) => {
          console.log("Message:", m); // Log the entire message object
          return <Message key={m.id} message={m} />;
        })}
      </div>
      <div className={ChatsCSS.textinput}>
        <input type="text" placeholder="Type something...." onChange={e=>setText(e.target.value)}/>
        <div className={ChatsCSS.send}>
          <IoMdAttach />
          <input type="file" style={{}} id="file" onChange={e=>setImg(e,target.files[0])}/>
          <label htmlFor="file">
            <img src="" alt="" />
          </label>
          <button onClick={handlesend }>Send</button>
        </div>
      </div>
    </div>
  );
};
