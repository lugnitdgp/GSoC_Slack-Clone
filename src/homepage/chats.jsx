import ChatsCSS from "./chats.module.css";
import { useContext, useEffect, useState } from "react";
import { Chatcontext } from "../context api/chatcontext";
import supabase from "../supabase.jsx";
import { IoMdAttach } from "react-icons/io";
import { Message } from "./message.jsx";
import { Allconvers } from "../context api/context.jsx";
import { v4 as uuid } from "uuid";
import { fetchUsermessages } from "../database.jsx";

export const Chats = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const { data } = useContext(Chatcontext);
  const { currentUser } = useContext(Allconvers);
  const [messages, setMessages] = useState([]);
  const [picurl, setPicurl] = useState(null);

  console.log(currentUser[0].id);
  console.log(data.chatId);
  useEffect(() => {
    const fetchmessages = async () => {
      const messagesuptained = await fetchUsermessages(data.chatId);
      if (messagesuptained) {
        console.log("messages", messagesuptained);
        setMessages(messagesuptained);
      }
    };
    fetchmessages();
  }, [data.chatId]);
  useEffect(() => {
    console.log("recieved msgs:", messages);
  }, [messages]);
  useEffect(() => {
    const message = () => {
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
    message();
  }, [data.chatId]);

  const handlesend = async () => {
    if (img) {
        console.log(img)
      const { data1, error1 } = await supabase.storage
        .from("photos")
        .upload(`dm/${uuid()}.png`,img);
  
      if (error1) {
        console.log(error1);
      } else if(data1){
        setPicurl(data1);
        console.log(picurl);//data1 here will be the path
        console.log(data1);
      }
      const { data2, error2 } = await supabase
        .from("chats_dm")
        .update({
          messages: [
            ...messages,
            {
              id: uuid,
              text: text,
              senderId: currentUser[0].id,
              date: new Date().toISOString(),
              image: picurl,
            },
          ],
        })
        .eq("id", data.chatId)
        .select();
        if (data2) {
            setText("");
            setImg(null);
            console.log("data2",data2)
          }
          else if(error2){
            console.log(error2)
          }
        
    } else {
      const { data3, error } = await supabase
        .from("chats_dm")
        .update({
          messages: [
            ...messages,
            {
              id: uuid,
              text: text,
              senderId: currentUser[0].id,
              date: new Date().toISOString(),
            },
          ],
        })
        .eq("id", data.chatId)
        .select();
        if (data3) {
            const { data, error } = await supabase
  .from("direct_messages")
  .update({
    dm_chats: supabase
      .from("direct_messages")
      .select("dm_chats") // Select only the dm_chats column
      .eq("id", currentUser[0].id)
      .single() // Get the direct message object
      .then((directMessage) => {
        if (directMessage.data && directMessage.data.dm_chats) {
          // Find the index of the message to update
          const messageIndex = directMessage.data.dm_chats.findIndex(
            (message) => message.uid === clickeduser.id
          );

          // Update the date if message found
          if (messageIndex > -1) {
            directMessage.data.dm_chats[messageIndex].date = new Date().toISOString();
            console.log("new date updated")
          }

          // Return the updated dm_chats array
          return directMessage.data.dm_chats;
        } else {
          return null; // Handle case where no direct message found
        }
      }),
  })
  .eq("id", currentUser[0].id)
  .select();
  console.log(currentUser[0])

            setText("");
            setImg(null);
          }
    }
    
  };
  console.log(messages);
  return (
    <div className={ChatsCSS.chat}>
      <div className={ChatsCSS.chatinfo}>
        <span>{data?.user.uusername}</span>
      </div>
      <div className={ChatsCSS.messages}>
        {messages.map((m) => {
           // Log the entire message object
          return <Message key={m.id} message={m} />;
        })}
      </div>
      <div className={ChatsCSS.textinput}>
        <input
          type="text"
          placeholder="Type something...."
          onChange={(e) => setText(e.target.value)}
        />
        <div className={ChatsCSS.send}>
          <IoMdAttach />
          <input
            type="file"
            id="file"
            onChange={(e) => setImg(e.target.files[0])}
          />
          <label htmlFor="file">
            <img src="" alt="" />
          </label>
          <button onClick={handlesend}>Send</button>
        </div>
      </div>
    </div>
  );
};
