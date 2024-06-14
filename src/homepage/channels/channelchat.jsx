import ChannelchatCSS from "./channelchat.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import supabase from "../../supabase.jsx";
import { IoMdAttach } from "react-icons/io";
import { Allconvers } from "../../context api/context.jsx";
import { v4 as uuid } from "uuid";
import {
  fetchUserchannelmessages,
  fetchUserDmChatsid,
} from "../../database.jsx";
import { Channelcontext } from "../../context api/channelcontext.jsx";
import { ChannelMessage } from "./channelmessage.jsx";

export const Channelchats = () => {
  const textRef = useRef(""); //usestate didnot work but useref worked to make the input clear after updation
  const imgRef = useRef(null);
  const { channel_data } = useContext(Channelcontext);
  const { currentUser } = useContext(Allconvers);
  const [messages, setMessages] = useState([]);
  const [picurl, setPicurl] = useState("");
  const messagesEndRef = useRef(null);
  const [msgupdate, setMsgupdate] = useState(false);

  console.log("heloo to channel");

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const fetchmessages = async () => {
      const messagesuptained = await fetchUserchannelmessages(
        channel_data.channel_id
      );
      if (messagesuptained) {
        setMessages(messagesuptained);
      }
    };
    fetchmessages();
  }, [channel_data.channel_id]);
  useEffect(() => {
    const fetchmessages = async () => {
      if (msgupdate) {
        const messagesuptained = await fetchUserchannelmessages(
          channel_data.channel_id
        );
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
        .channel("custom-filter-channel")
        .on(
          "postgres_changes",
          {
            event: "*", //channels are used to listen to real time changes
            schema: "public", //here we listen to the changes in realtime and update the postgres changes here
            table: "channels_message",
            select: "messages",
            filter: `id=eq.${channel_data}`,
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
  }, [channel_data.channel_id]);

  const handlesend = async () => {
    const img = imgRef.current.files[0];
    const text = textRef.current.value;
    if (img) {
      const path = channel_data.channel_id + "/" + uuid();
      const { data: data1, error: error1 } = await supabase.storage
        .from("photos")
        .upload(`${path}`, img);
      if (error1) {
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
                date: new Date().toISOString(),
                image: puburl,
              },
            ],
          })
          .eq("id", channel_data.channel_id)
          .select();
        if (data2) {
          setMsgupdate(true);

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
              id: uuid(),
              text: text,
              senderId: currentUser[0].id,
              date: new Date().toISOString(),
            },
          ],
        })
        .eq("id", channel_data.channel_id)
        .select();
      if (data3) {
        setMsgupdate(true);
        textRef.current.value = "";
        imgRef.current.value = null;
      }
    }
  };

  return (
    <div className={ChannelchatCSS.chat}>
      <div className={ChannelchatCSS.chatinfo}>
        <span>{channel_data?.channelname}</span>
      </div>
      <div className={ChannelchatCSS.messages}>
        {messages.map((m) => {
          return <ChannelMessage key={m.channel_id} message={m} />;
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className={ChannelchatCSS.chatinput}>
        <textarea
          placeholder="Type something...."
          ref={textRef}
          className={ChannelchatCSS.textinput}
        />
        <div className={ChannelchatCSS.send}>
          <label htmlFor="file">
            <IoMdAttach className={ChannelchatCSS.attachIcon} size={45} />
          </label>
          <input
            type="file"
            id="file"
            ref={imgRef}
            style={{ display: "none" }} // hide the file input
          />
        </div>
        <button className={ChannelchatCSS.sendbutton} onClick={handlesend}>
          Send
        </button>
      </div>
    </div>
  );
  return <></>;
};
