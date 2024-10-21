import ChatsCSS from "./chats.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import { Chatcontext } from "../../context api/chatcontext.jsx";
import supabase from "../../supabase.jsx";
import { IoMdAttach } from "react-icons/io";
import { Message } from "./message.jsx";
import { Allconvers } from "../../context api/context.jsx";
import { v4 as uuid } from "uuid";
import { fetchUsermessages, fetchUserDmChatsid } from "../../database.jsx";
import { IoIosSend } from "react-icons/io";

export const Chats = () => {
  const textRef = useRef(""); //usestate didnot work but useref worked to make the input clear after updation
  const imgRef = useRef(null);
  const { data } = useContext(Chatcontext);
  const { currentUser, setloader } = useContext(Allconvers);
  const [messages, setMessages] = useState([]);
  const [picurl, setPicurl] = useState("");
  const messagesEndRef = useRef(null);
  const [msgupdate, setMsgupdate] = useState(false);
  const [chatshow, setchatshow] = useState(false);
  const [chatshow2, setchatshow2] = useState(false);

  useEffect(() => {
    const fetchchat = async () => {
      const chat = await fetchUserDmChatsid(data?.user.uid);

      if (chatshow2 && chat) {
        const updatedchat = chat.map((obj) =>
          obj.combinedId === data.chatId ? { ...obj, showstatus: true } : obj
        );
        const { data: update2, error: er2 } = await supabase
          .from("direct_messages")
          .update({
            dm_chats: updatedchat,
          })
          .eq("id", data?.user.uid)
          .select();
        if (update2) {
          console.log("UPDATED2");
          setchatshow2(false);
        } else {
          console.log(er2);
        }
      }
    };
    fetchchat();
  }, [data, chatshow2]);
  useEffect(() => {
    const fetchchat = async () => {
      const chat = await fetchUserDmChatsid(currentUser[0].id);
      console.log(chat);
      if (chatshow && chat) {
        const updatedchat = chat.map((obj) =>
          obj.combinedId === data.chatId ? { ...obj, showstatus: true } : obj
        );
        console.log(updatedchat);
        const { data: update, error: er } = await supabase
          .from("direct_messages")
          .update({
            dm_chats: updatedchat,
          })
          .eq("id", currentUser[0].id)
          .select();
        if (update) {
          console.log("UPDATED");
          setchatshow(false);
        } else {
          console.log(er);
        }
      }
    };
    fetchchat();
  }, [currentUser, chatshow]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const fetchmessages = async () => {
      setloader(true);
      const messagesuptained = await fetchUsermessages(data.chatId);
      if (messagesuptained) {
        setMessages(messagesuptained);
        setloader(false);
      }
      setloader(false);
    };
    fetchmessages();
  }, [data.chatId]);
  useEffect(() => {
    const fetchmessages = async () => {
      if (msgupdate) {
        setloader(true);
        const messagesuptained = await fetchUsermessages(data.chatId);
        if (messagesuptained) {
          setMessages(messagesuptained);
          setMsgupdate(false);
          setloader(false);
        }
      }
      setloader(false);
    };
    fetchmessages();
  }, [msgupdate]);

  useEffect(() => {
    const message = () => {
      console.log(msgupdate);

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

  const handlesend = async () => {
    setloader(true);
    const img = imgRef.current.files[0];
    const text = textRef.current.value;
    if (img) {
      const path = data.chatId + "/" + uuid();
      const { data: data1, error: error1 } = await supabase.storage
        .from("photos")
        .upload(`${path}`, img);
      if (error1) {
        setloader(false);
        console.log(error1);
      } else if (data1) {
        let url = supabase.storage.from("photos").getPublicUrl(data1.path); //here in the url we habe data in which publicUrl is present

        //first gave that value to a const and then setPicurl
        const puburl = url.data.publicUrl;
        setPicurl(puburl);

        const { data: data2, error: error2 } = await supabase
          .from("chats_dm")
          .update({
            messages: [
              ...messages,
              {
                id: uuid(),
                text: text,
                senderId: currentUser[0].id,
                date: new Date().toLocaleString(),
                image: puburl,
              },
            ],
          })
          .eq("id", data.chatId)
          .select();

        if (data2) {
          setMsgupdate(true);
          setchatshow(true);
          setchatshow2(true);
          textRef.current.value = "";
          imgRef.current.value = null;
          setloader(false);
        } else if (error2) {
          console.log(error2);
          setloader(false);
        }
      }
    } else {
      const { data: data3, error: error3 } = await supabase
        .from("chats_dm")
        .update({
          messages: [
            ...messages,
            {
              id: uuid(),
              text: text,
              senderId: currentUser[0].id,
              date: new Date().toLocaleString(),
            },
          ],
        })
        .eq("id", data.chatId)
        .select();
      if (data3) {
        setMsgupdate(true);
        setchatshow(true);
        setchatshow2(true);
        textRef.current.value = "";
        imgRef.current.value = null;
        setloader(false);
      }
    }
  };

  return (
    <div className={ChatsCSS.chat}>
      <div className={ChatsCSS.chatinfo}>
        <span>{data?.user.uusername}</span>
      </div>
      <div className={ChatsCSS.messages}>
        {messages.map((m) => {
          return <Message key={m.id} message={m} />;
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className={ChatsCSS.chatinput}>
        <textarea
          placeholder="Type something...."
          ref={textRef}
          className={ChatsCSS.textinput}
        />
        <div className={ChatsCSS.send}>
          <label htmlFor="file">
            <IoMdAttach className={ChatsCSS.attachIcon} />
          </label>
          <input
            type="file"
            id="file"
            ref={imgRef}
            style={{ display: "none" }} // hide the file input
          />
        </div>
        <button className={ChatsCSS.sendbutton} onClick={handlesend}>
          <IoIosSend size={28}/>
        </button>
      </div>
    </div>
  );
};
