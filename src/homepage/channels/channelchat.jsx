import ChannelchatCSS from "./channelchat.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import supabase from "../../supabase.jsx";
import { IoMdAttach } from "react-icons/io";
import { Allconvers } from "../../context api/context.jsx";
import { v4 as uuid } from "uuid";
import { IoMdPersonAdd } from "react-icons/io";
import {
  fetchUserchannelmessages,
  fetchUserchannels,
} from "../../database.jsx";
import { Channelcontext } from "../../context api/channelcontext.jsx";
import { ChannelMessage } from "./channelmessage.jsx";
import { IoMdContacts } from "react-icons/io";
import Addmember from "./addchannelmember.jsx";

export const Channelchats = () => {
  const textRef = useRef(""); //usestate didnot work but useref worked to make the input clear after updation
  const imgRef = useRef(null);
  const { channel_data } = useContext(Channelcontext);
  const { currentUser, setaddchannelmember, setShowmembers, showmembers } =
    useContext(Allconvers);
  const [messages, setMessages] = useState([]);
  const [picurl, setPicurl] = useState("");
  const messagesEndRef = useRef(null);
  const [msgupdate, setMsgupdate] = useState(false);
  const [addusericon, setaddusericon] = useState(false);
  const [accepted, setaccepted] = useState(false);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const fetchmessages = async () => {
      setaccepted(false);
      const messagesuptained = await fetchUserchannelmessages(
        channel_data.channel_id
      );
      if (messagesuptained) {
        setMessages(messagesuptained);
        console.log(messages);
      }
      if (channel_data.allowshow == true) {
        setaccepted(true);
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
            filter: `channel_id=eq.${channel_data.channel_id}`,
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
  useEffect(() => {
    setaddusericon(false);
    const admins = channel_data.channeladmins;
    console.log(admins);
    Object.entries(admins)?.map((admin) => {
      //to allow the add user optiion only for admin
      console.log(admin);
      if (admin[1].id == currentUser[0].id) {
        setaddusericon(true);
      }
    });
  }, [channel_data]);

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
          .from("channels_message")
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
          .eq("channel_id", channel_data.channel_id)
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
        .from("channels_message")
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
        .eq("channel_id", channel_data.channel_id)
        .select();
      if (data3) {
        setMsgupdate(true);
        textRef.current.value = "";
        imgRef.current.value = null;
      }
    }
  };
  const acceptinvite = async () => {
    const fetchedchanneldata = await fetchUserchannels(currentUser[0]);
    console.log(fetchedchanneldata);
    fetchedchanneldata.forEach((channel) => {
      if (channel.channel_id === channel_data.channel_id) {
        channel.allowshow = true;
      }
    });
    const { data: userchannelupdate, error: channelerr } = await supabase
      .from("channels_list")
      .update({
        channels: fetchedchanneldata,
      })
      .eq("id", currentUser[0].id)
      .select();
    if (userchannelupdate) {
      console.log("channel updated");
      setaccepted(true);
    }
    console.log(fetchedchanneldata);
  };
  useEffect(() => {
    console.log(showmembers);
  }, [showmembers]);
  return (
    <>
      <div className={ChannelchatCSS.chat}>
        <div className={ChannelchatCSS.chatinfo}>
          <span>{channel_data?.channelname}</span>
          {addusericon && channel_data.allowshow && accepted ? (
            <>
              <IoMdContacts
                onClick={() => setShowmembers(true)} // Call the function to update state
                style={{ cursor: "pointer" }}
              />
              <IoMdPersonAdd
                onClick={() => setaddchannelmember(true)} // Call the function to update state
                style={{ cursor: "pointer" }}
              />
            </>
          ) : (
            <IoMdContacts
              onClick={() => setShowmembers(true)} // Call the function to update state
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        {!channel_data.allowshow && !accepted ? (
          <>
            <div className={ChannelchatCSS.acceptbox}>
              <div className={ChannelchatCSS.creatorinfo}>
                <p className={ChannelchatCSS.acceptp}>
                  You were added into this Channel by "
                  {channel_data.channelinfo.createdby}"{" "}
                </p>
              </div>
              <div className={ChannelchatCSS.acceptance}>
                <button
                  className={ChannelchatCSS.accept}
                  onClick={acceptinvite}
                >
                  Accept the Invitation
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={ChannelchatCSS.messages}>
              {messages.map((m) => (
                <ChannelMessage key={m.channel_id} message={m} />
              ))}
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
              <button
                className={ChannelchatCSS.sendbutton}
                onClick={handlesend}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
