import supabase from "../../supabase.jsx";
import { useContext, useEffect, useRef, useState } from "react";
import { Allconvers } from "../../context api/context";
import AddchannnelCSS from "./addchannel.module.css";
import { insertchannelid, fetchUserchannels } from "../../database";
import { v4 as uuid } from "uuid";
import { Channelcontext } from "../../context api/channelcontext.jsx";
const Addchannel = () => {
  const { addchannel, setAddchannel, currentUser } = useContext(Allconvers);
  const { dispatchchannel } = useContext(Channelcontext);
  const [currentuserchannels, setCurrentuserchannels] = useState({});
  console.log(currentUser[0]);
  const channel = useRef("");
  useEffect(() => {
    const fetchchannel = async () => {
      const user = await fetchUserchannels(currentUser[0]);
      if (user) {
        setCurrentuserchannels(user);
        console.log(currentuserchannels);
      }
    };
    fetchchannel();

    // Cleanup function to potentially unsubscribe from subscriptions or close connections
  }, [currentUser]);

  useEffect(() => {
    console.log(currentuserchannels);
  }, [currentuserchannels]);

  const clear = () => {
    channel.current.value = "";
    setAddchannel(false);
  };
  const create = async () => {
    const channelname = channel.current.value;
    const id = uuid();
    const creation = await insertchannelid(id, channelname);
    if (creation) {
      const checkIdExists = (channels) =>
        channels.some((channel) => channel.channel_id === id);

      const currentUserIdExists = checkIdExists(currentuserchannels);
      if (!currentUserIdExists) {
        const { data, error } = await supabase
          .from("channels_list")
          .update({
            channels: [
              ...currentuserchannels,
              {
                channel_id: id,
                channelname: channelname,
                channelinfo: {
                  createdby: currentUser[0].username,
                  createdbyid: currentUser[0].id,
                },
                date: new Date().toISOString(),
                allowshow: true,
              },
            ],
          })
          .eq("id", currentUser[0].id)
          .select();

        if (error) {
          console.error("Error updating channels:", error);
        } else {
          console.log("channel updated:", data);
          dispatchchannel({
            type: "Change_channel",
            payload: {
              channel_id: id,
              channelname: channelname,
              channelinfo: {
                createdby: currentUser[0].username,
                createdbyid: currentUser[0].id,
              },
              allowshow: true,
            },
          });
          setAddchannel(false);
        }
      }
    }
  };
  if (addchannel) {
    return (
      <div className={AddchannnelCSS.body}>
        <div className={AddchannnelCSS.box}>
          <div className={AddchannnelCSS.h1}>
            <h1>Add Channel</h1>
          </div>
          <div className={AddchannnelCSS.inputbox}>
            <input
              type="text"
              placeholder="Enter the Channel Name"
              className={AddchannnelCSS.input}
              ref={channel}
            />
          </div>
          <div className={AddchannnelCSS.bottom}>
            <div className={AddchannnelCSS.cancel} onClick={clear}>
              Clear
            </div>
            <div className={AddchannnelCSS.submit} onClick={create}>
              Create
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Addchannel;
