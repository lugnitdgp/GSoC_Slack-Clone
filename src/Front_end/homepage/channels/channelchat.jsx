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
  updatechannel,
  fetchUserchannelsbyid,
  Getuserdetails,
  allidsinlist,
} from "../../database.jsx";
import { Channelcontext } from "../../context api/channelcontext.jsx";
import { ChannelMessage } from "./channelmessage.jsx";
import { IoMdContacts } from "react-icons/io";
import { MdAssignmentAdd } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";

export const Channelchats = () => {
  const textRef = useRef(""); //usestate didnot work but useref worked to make the input clear after updation
  const imgRef = useRef(null);
  const { channel_data, dispatchchannel } = useContext(Channelcontext);
  const {
    currentUser,
    setaddchannelmember,
    setShowmembers,
    showmembers,
    addusericon,
    setaddusericon,
    loadadmincheck,
    setloadadmincheck,
    setDm,
    setConformdm,
    setChannelchat,
    fetchchannelupdate,
    setFetchchannelupdate,
    setchat,
    assigntask,
    setAssigntask,
    setViewchanneltask,
  } = useContext(Allconvers);
  const [messages, setMessages] = useState([]);
  const [picurl, setPicurl] = useState("");
  const messagesEndRef = useRef(null);
  const [msgupdate, setMsgupdate] = useState(false);
  const [allowshow, setallowshow] = useState(false);
  const [accepted, setaccepted] = useState(false);
  if (channel_data?.channel_id) {
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
      setloadadmincheck(false);
      console.log(loadadmincheck);
      if (!loadadmincheck) {
        const admins = channel_data.channeladmins;
        const show = channel_data.allowshow;
        setallowshow(show);
        Object.entries(admins)?.map((admin) => {
          //to allow the add user optiion only for admin
          console.log(admin);
          if (admin[1].id === currentUser[0].id) {
            console.log(admin[1].id === currentUser[0].id);
            setaddusericon(true);
            console.log(addusericon);
          }
        });
      }
    }, [channel_data, loadadmincheck]);
    useEffect(() => {
      console.log(allowshow);
    }, [allowshow]);
    useEffect(() => {
      console.log(addusericon);
    }, [addusericon]);
    useEffect(() => {
      console.log(accepted);
    }, [accepted]);
    useEffect(() => {
      console.log(loadadmincheck);
    }, [loadadmincheck]);
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
                  date: new Date().toLocaleString(),
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
                date: new Date().toLocaleString(),
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
      const message = () => {
        console.log(msgupdate);

        const channelsupd = supabase
          .channel("channel")
          .on(
            "postgres_changes",
            {
              event: "*", //channels are used to listen to real time changes
              schema: "public", //here we listen to the changes in realtime and update the postgres changes here
              table: "channels_list",
              select: "channels",
              filter: `id=eq.${currentUser[0].id}`,
            },
            (payload) => {
              const updatedchannelslist = payload.new.channels.filter(
                //getting all ids that are not to be deleted
                (channel) => channel.channel_id == channel_data.channel_id
              );
              console.log(updatedchannelslist);
              dispatchchannel({
                type: "Change_channel",
                payload: updatedchannelslist[0],
              });
            }
          )
          .subscribe();

        // Cleanup function to unsubscribe from the channel to avoid data leakage
        return () => {
          supabase.removeChannel(channelsupd);
        };
      };
      message();
    }, [channel_data.channel_id]);
    const Removechannel = async () => {
      try {
        if (
          channel_data.channeladmins.some(
            (admin) => admin.id === currentUser[0].id
          )
        ) {
          const allids = await allidsinlist();
          for (const Id of allids) {
            const userChannels = await fetchUserchannelsbyid(Id.id);
            const usermail = await Getuserdetails(Id.id);
            console.log(usermail);
            if (userChannels.length > 0) {
              const newchannels = userChannels.filter(
                (channel) => channel.channel_id !== channel_data.channel_id
              );
              if (
                userChannels?.some(
                  (channe) => channe.channel_id === channel_data.channel_id
                )
              ) {
                try {
                  const response = await fetch(
                    `http://localhost:${
                      import.meta.env.VITE_Backend_Port
                    }/api/sendUserEmail`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        to: usermail[0].email,
                        subject: `Channel was deleted`,
                        message: `A Channel:"${channel_data.channelname}",was deleted by "${currentUser[0].username}"`,
                      }),
                    }
                  );
                  if (!response.ok) {
                    throw new Error("Failed to send email");
                  }
                  console.log("Email sent successfully");
                } catch (error) {
                  console.error("Error sending email:", error);
                }
              }
              const updatedUserChannels = await updatechannel(
                Id.id,
                newchannels
              );

              console.log(
                "Updated userChannels in database:",
                updatedUserChannels
              );
            }
          }
        }
        const { error: delerr } = await supabase
          .from("channels_message")
          .delete()
          .eq("channel_id", channel_data.channel_id);
        const { error: dele } = await supabase
          .from("Channel_todolist")
          .delete()
          .eq("id", channel_data.channel_id);

        const channelscurrent = await fetchUserchannelsbyid(currentUser[0].id);
        console.log(channelscurrent);
        const updatedchannel = channelscurrent.filter(
          (channel) => channel.channel_id !== channel_data.channel_id
        );

        const chanresult = await updatechannel(
          currentUser[0].id,
          updatedchannel
        );
      } catch (error) {
        console.error("Error removing member:", error);
      }
    };
    const [showOptions, setShowOptions] = useState(false);

    const toggleOptions = () => {
      setShowOptions(!showOptions);
    };

    return (
      <>
        <div className={ChannelchatCSS.chat}>
          <div className={ChannelchatCSS.chatinfo}>
            <span>{channel_data?.channelname}</span>

            {/* Three-dots icon for additional options */}
            <BsThreeDotsVertical
              onClick={toggleOptions}
              style={{ cursor: "pointer" }}
            />
            {showOptions && (
              <div className={ChannelchatCSS.additional_options}>
                {/* Icons for main actions */}
                {addusericon && allowshow && accepted ? (
                  <>
                    <FaTasks
                      onClick={() => setViewchanneltask(true)}
                      style={{ cursor: "pointer" }}
                    />
                    <MdAssignmentAdd
                      onClick={() => setAssigntask(true)}
                      style={{ cursor: "pointer" }}
                    />
                    <IoMdContacts
                      onClick={() => setShowmembers(true)}
                      style={{ cursor: "pointer" }}
                    />
                    <IoMdPersonAdd
                      onClick={() => setaddchannelmember(true)}
                      style={{ cursor: "pointer" }}
                    />
                    <RiDeleteBin6Fill
                      onClick={() => Removechannel()}
                      style={{ cursor: "pointer" }}
                    />
                  </>
                ) : allowshow && accepted ? (
                  <>
                    <FaTasks
                      onClick={() => setViewchanneltask(true)}
                      style={{ cursor: "pointer" }}
                    />
                    <IoMdContacts
                      onClick={() => setShowmembers(true)}
                      style={{ cursor: "pointer" }}
                    />
                  </>
                ) : (
                  <IoMdContacts
                    onClick={() => setShowmembers(true)}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </div>
            )}
          </div>
          {!channel_data.allowshow && !accepted ? (
            <>
              <div className={ChannelchatCSS.acceptbox}>
                <div className={ChannelchatCSS.creatorinfo}>
                  <p className={ChannelchatCSS.acceptp}>
                    You were added into this Channel by "
                    {channel_data.addedby.addername}"
                  </p>
                </div>
                <div className={ChannelchatCSS.acceptance}>
                  <button
                    className={ChannelchatCSS.accept}
                    onClick={() => acceptinvite()}
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
                    <IoMdAttach className={ChannelchatCSS.attachIcon} />
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
  } else {
    setchat(false);
    setAssigntask(false);
    setConformdm(false);
    setDm(false);
    setViewchanneltask(false);
    setShowmembers(false);
    setaddchannelmember(false);
    setChannelchat(false);
    setFetchchannelupdate(true);
  }
};
