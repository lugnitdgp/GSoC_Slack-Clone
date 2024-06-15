import supabase from "../../supabase";
import addmemberCSS from "./addchannelmember.module.css";
import { ImCross } from "react-icons/im";
import { Allconvers } from "../../context api/context";
import { Channelcontext } from "../../context api/channelcontext";
import { useContext, useEffect, useState } from "react";
import {
  UserdetailsbyName,
  fetchchannelmember,
  insertchannelmember,
  fetchUserchannels,
} from "../../database";

const Addmember = () => {
  const { setaddchannelmember } = useContext(Allconvers);
  const [Username, setUsername] = useState("");
  const [user, setUser] = useState(null); // Stores searched user data
  const [channelmem, setchannelmem] = useState([]); // Array of existing channel members
  const { channel_data } = useContext(Channelcontext);
  const [refreshchannel, setrefreshchannel] = useState(false);

  console.log(channel_data);

  const fetchChannelMembers = async () => {
    const chid = await fetchchannelmember(channel_data.channel_id);
    setchannelmem(chid);
    console.log(channelmem);
  };

  useEffect(() => {
    fetchChannelMembers();
  }, [channel_data]);

  useEffect(() => {
    if (refreshchannel) {
      fetchChannelMembers();
      setrefreshchannel(false);
    }
  }, [refreshchannel]);

  const handleInput = (e) => {
    if (e.code === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    const fetchedUser = await UserdetailsbyName(Username);

    if (fetchedUser && fetchedUser.length > 0) {
      setUser(fetchedUser); // Update searched user data
    } else {
      setUser(null); // Set user to null to display "No User Found"
    }
  };

  const handleUser = async (u) => {
    // Check if user is already in the channel before any actions
    if (
      !channelmem.some((member) =>
        member.channel_members.some((cm) => cm.member_id === u.id)
      )
    ) {
      const fetcheduser = await fetchUserchannels(u);
      console.log(fetcheduser);
      if (fetcheduser) {
        const { data: userchannelupdate, error: channelerr } = await supabase
          .from("channels_list")
          .update({
            channels: [
              ...fetcheduser,
              {
                channel_id: channel_data.channel_id,
                channelname: channel_data.channelname,
                channelinfo: channel_data.channelinfo,
                date: new Date().toISOString(),
                allowshow: false,
              },
            ],
          })
          .eq("id", u.id)
          .select();

        if (userchannelupdate) {
          console.log(channelmem[0].channel_members);
          const newmember = [
            ...channelmem[0].channel_members,
            {
              member_id: u.id,
              member_name: u.username,
              member_mail: u.email,
            },
          ];
          console.log(newmember);
          const memupdate = await insertchannelmember(
            channel_data.channel_id,
            newmember
          );
          if (memupdate) {
            console.log("mem update successful");
            setrefreshchannel(true);
          }
        }
        console.log("Add user to channel:", u);
      }
    } else {
      console.log("User already exists in the channel");
    }
  };

  return (
    <div className={addmemberCSS.body}>
      <div className={addmemberCSS.box}>
        <div className={addmemberCSS.head}>
          <h1 className={addmemberCSS.h1}>Add a Member</h1>
          <ImCross
            size={16}
            onClick={() => {
              setaddchannelmember(false);
            }}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className={addmemberCSS.inputbox}>
          <input
            type="text"
            className={addmemberCSS.input}
            placeholder="Search for a member"
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleInput}
          />
        </div>
        <div className={addmemberCSS.searchresult}>
          {user ? (
            user.map((u) => (
              <div
                key={u.id}
                className={
                  channelmem.some((member) =>
                    member.channel_members.some((cm) => cm.member_id === u.id)
                  )
                    ? addmemberCSS.disabled
                    : addmemberCSS.Suserbox
                }
                onClick={() => {
                  handleUser(u);
                }}
                style={{
                  cursor: channelmem.some((member) =>
                    member.channel_members.some((cm) => cm.member_id === u.id)
                  )
                    ? "not-allowed"
                    : "pointer",
                }} // Set cursor style
              >
                <div className={addmemberCSS.Suserphoto}>
                  <img
                    src={u.avatar_url}
                    alt={u.username} // Descriptive alt text for accessibility
                    className={addmemberCSS.img}
                  />
                </div>
                <div className={addmemberCSS.Suserinfo}>
                  <div className={addmemberCSS.Suserexist}>
                    <p className={addmemberCSS.namep}>{u.username}</p>
                    <p className={addmemberCSS.mailp}>{u.email}</p>
                  </div>
                  {channelmem.some((member) =>
                    member.channel_members.some((cm) => cm.member_id === u.id)
                  ) && (
                    <div className={addmemberCSS.Suserdsntexist}>
                      <p className={addmemberCSS.alreadyExists}>
                        Already Exists
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={addmemberCSS.noUsers}>No users found.</div> // Informative message
          )}
        </div>
      </div>
    </div>
  );
};

export default Addmember;
