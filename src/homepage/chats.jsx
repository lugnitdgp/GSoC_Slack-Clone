import ChatsCSS from "./chats.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import { Chatcontext } from "../context api/chatcontext";
import supabase from "../supabase.jsx";
import { IoMdAttach } from "react-icons/io";
import { Message } from "./message.jsx";
import { Allconvers } from "../context api/context.jsx";
import { v4 as uuid } from "uuid";
import { fetchUsermessages } from "../database.jsx";

export const Chats = () => {
  const textRef = useRef(""); //usestate didnot work but useref worked to make the input clear after updation
  const imgRef = useRef(null);
  const { data } = useContext(Chatcontext);
  const { currentUser } = useContext(Allconvers);
  const [messages, setMessages] = useState([]);
  const [picurl, setPicurl] = useState("");

  console.log(currentUser[0].id);
  console.log(data.chatId);
  useEffect(() => {
    const fetchmessages = async () => {
      const messagesuptained = await fetchUsermessages(data.chatId);
      if (messagesuptained) {
        setMessages(messagesuptained);
      }
    };
    fetchmessages();
  }, [data.chatId]);
  useEffect(() => {}, [messages]);
  useEffect(() => {
    const message = () => {
      const chatsDm = supabase
        .channel("custom-filter-channel")
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
            console.log("Change received!", payload);
            setMessages((prevmessages) => {
              const updatedmessages = [...prevmessages, payload.new];

              return updatedmessages;
            });
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

  const handlesend = async () => {
    const img = imgRef.current.files[0];
    const text = textRef.current.value;
    if (img) {
      console.log(img);
      const path = data.chatId + "/" + uuid();
      const { data: data1, error: error1 } = await supabase.storage
        .from("photos")
        .upload(`${path}`, img);
      if (error1) {
        console.log(error1);
      } else if (data1) {
        let url = supabase.storage.from("photos").getPublicUrl(data1.path); //here in the url we habe data in which publicUrl is present
        console.log(url.data.publicUrl);
        const puburl = url.data.publicUrl;
        console.log(puburl); //first gave that value to a const and then setPicurl
        setPicurl(puburl);
        console.log(picurl);
        const { data: data2, error: error2 } = await supabase
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
          textRef.current.value = "";
          imgRef.current.value = null;
        } else if (error2) {
          console.log(error2);
        }
      }
    } else {
      const { data: data3, error: error3 } = await supabase
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
        textRef.current.value = "";
        imgRef.current.value = null;
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
          console.log(m)// Log the entire message object
          return <Message key={m.id} message={m} />;
        })}
      </div>
      <div className={ChatsCSS.chatinput}>
        <textarea placeholder="Type something...." ref={textRef} className={ChatsCSS.textinput}/>
        <div className={ChatsCSS.send}>
        <label htmlFor="file">
          <IoMdAttach className={ChatsCSS.attachIcon} size={45}/>
        </label>
        <input
          type="file"
          id="file"
          ref={imgRef}
          style={{ display: "none" }} // hide the file input
        />
        </div>
          <button className={ChatsCSS.sendbutton} onClick={handlesend}>Send</button>
      </div>
    </div>
  );
};
