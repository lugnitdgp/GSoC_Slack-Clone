import supabase from "../../supabase.jsx";
import { useContext, useEffect, useRef, useState } from "react";
import { Allconvers } from "../../context api/context";
import AddchannnelCSS from "./addchannel.module.css";
import {
  insertchannelid,
  fetchUserchannels,
  fetchUserchannelmembers,
  insertchannelmember,
  insertchanneldolistid,
} from "../../database";
import { v4 as uuid } from "uuid";
import { Channelcontext } from "../../context api/channelcontext.jsx";

const Addchannel = () => {
  const { addchannel, setAddchannel, currentUser } = useContext(Allconvers);
  const { dispatchchannel } = useContext(Channelcontext);
  const [currentuserchannels, setCurrentuserchannels] = useState({});
  const channel = useRef("");

  useEffect(() => {
    const fetchchannel = async () => {
      const user = await fetchUserchannels(currentUser[0]);
      if (user) {
        setCurrentuserchannels(user);
      }
    };
    fetchchannel();
  }, [currentUser]);

  const clear = () => {
    channel.current.value = "";
    setAddchannel(false);
  };

  const createChannel = async () => {
    const channelname = channel.current.value.trim();
    if (channelname === "") {
      return; // Exit early if channel name is empty
    }

    const id = uuid();
    const creation = await insertchannelid(id, channelname);
    const insertionlist = await insertchanneldolistid(id);

    if (creation && insertionlist) {
      const checkIdExists = (channels) =>
        channels.some((channel) => channel.channel_id === id);

      const currentUserIdExists = checkIdExists(currentuserchannels);

      if (!currentUserIdExists) {
        try {
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
                    adminid: [{ id: currentUser[0].id }],
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
            const members = await fetchUserchannelmembers(id);
            const newmember = [
              ...members,
              {
                member_id: currentUser[0].id,
                member_name: currentUser[0].username,
                member_mail: currentUser[0].email,
              },
            ];
            await insertchannelmember(id, newmember);
            dispatchchannel({
              type: "Change_channel",
              payload: {
                channel_id: id,
                channelname: channelname,
                channelinfo: {
                  createdby: currentUser[0].username,
                  createdbyid: currentUser[0].id,
                  adminid: [{ id: currentUser[0].id }],
                },
                allowshow: true,
              },
            });
          }
        } catch (error) {
          console.error("Error creating channel:", error);
        } finally {
          setAddchannel(false);
        }
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      createChannel();
    } else if (e.key === "Escape") {
      clear();
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
              onKeyDown={handleKeyPress}
            />
          </div>
          <div className={AddchannnelCSS.bottom}>
            <div className={AddchannnelCSS.cancel} onClick={clear}>
              Clear
            </div>
            <div className={AddchannnelCSS.submit} onClick={createChannel}>
              Create
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Addchannel;
