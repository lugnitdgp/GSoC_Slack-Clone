import { useContext, useEffect, useState } from "react";
import supabase from "../../supabase";
import channelmembersCSS from "./membersofchannel.module.css";
import { Allconvers } from "../../context api/context";
import { ImCross } from "react-icons/im";
import { Channelcontext } from "../../context api/channelcontext";
import { fetchchannelmember, Getuserdetails } from "../../database";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  fetchUserchannelsbyid,
  allidsinlist,
  fetchUserchannels,
  updatechannel,
  fetchUserchannelmembers,
  insertchannelmember,
} from "../../database";

const Showmembers = () => {
  const {
    showmembers,
    setShowmembers,
    currentUser,
    setaddusericon,
    loadadmincheck,
    setloadadmincheck,
  } = useContext(Allconvers);
  const [members, setMembers] = useState([]);
  const [refreshmem, setrefreshmem] = useState(false);
  const { channel_data, dispatchchannel } = useContext(Channelcontext);
  const [fetchdone, setfetchdone] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fetchchannelupdate, setFetchchannelupdate] = useState(false);
  if (channel_data?.channel_id) {
    useEffect(() => {
      const fetchMemAndDetails = async () => {
        const members = await fetchchannelmember(channel_data.channel_id);
        const memberIds = members[0].channel_members;
        const detailedMembers = await Promise.all(
          //Promise.all is used to wait till complete fetching is done and the data is static as mapping can't be done to data that is being received
          memberIds.map(async (memberId) => {
            try {
              const memberDetails = await Getuserdetails(memberId.member_id);
              return memberDetails;
            } catch (error) {
              console.error(error);
              return null;
            }
          })
        );
        setMembers(detailedMembers.filter(Boolean));
        setrefreshmem(false);
        setfetchdone(true);
      };

      fetchMemAndDetails();
    }, [channel_data.channel_id, refreshmem]);

    useEffect(() => {
      const fetch = async () => {
        if (fetchchannelupdate) {
          try {
            const updchannel = await fetchUserchannels(currentUser[0]);
            console.log(updchannel);
            const updatedchannelslist = updchannel.filter(
              //getting all ids that are not to be deleted
              (channel) => channel.channel_id == channel_data.channel_id
            );

            setloadadmincheck(true);

            dispatchchannel({
              type: "ADMIN_UPDATE",
              payload: updatedchannelslist[0].channelinfo.adminid,
            });

            if (!loadadmincheck) {
              if (
                channel_data.channeladmins.some(
                  (admin) => admin.id === currentUser[0].id
                )
              ) {
                setIsAdmin(true);
                setaddusericon(true);
              } else {
                setIsAdmin(false);
                setaddusericon(true);
              }
            }
          } catch (error) {
            console.log(error);
          }
          setFetchchannelupdate(false);
        }
      };
      fetch();
    }, [fetchchannelupdate]);

    useEffect(() => {
      const channellisten = () => {
        const channel = supabase
          .channel("channel_list")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "channels_list",
              filter: `id=eq.${currentUser[0].id}`,
            },
            (payload) => {
              setFetchchannelupdate(true);
              console.log("Change received!", payload);
            }
          )
          .subscribe();
        return () => {
          supabase.removeChannel(channel);
        };
      };
      channellisten();
    }, [channel_data.channel_id]);

    useEffect(() => {
      if (!loadadmincheck) {
        if (
          channel_data.channeladmins.some(
            (admin) => admin.id === currentUser[0].id
          )
        ) {
          setIsAdmin(true);
          setaddusericon(true);
        } else {
          setIsAdmin(false);
          setaddusericon(true);
        }
      }
      const channellisten = () => {
        const channel = supabase
          .channel("currentchannel_list")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "channels_list",
              filter: `id=eq.${currentUser[0].id}`,
            },
            (payload) => {
              setFetchchannelupdate(true);
              console.log("Change received!", payload);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      };
      channellisten();
    }, [showmembers]);

    useEffect(() => {
      const fetchmem = async () => {
        const currentmem = await fetchchannelmember(channel_data.channel_id);
        const currentmember = currentmem[0].channel_members;
        const detailedMembers = await Promise.all(
          currentmember.map(async (memberId) => {
            try {
              const memberDetails = await Getuserdetails(memberId.member_id);
              return memberDetails;
            } catch (error) {
              console.error(error);
              return null;
            }
          })
        );
        setMembers(detailedMembers.filter(Boolean));
      };
      fetchmem();
    }, []);

    useEffect(() => {
      if (username === "") {
        setrefreshmem(true);
      }
    }, [username]);

    useEffect(() => {
      const memb = () => {
        const me = supabase //for realtime messages update listening
          .channel("custom-filter-member")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "channels_message",
              filter: `channel_id=eq.${channel_data.channel_id}`,
            },
            (payload) => {
              setrefreshmem(true);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(me);
        };
      };
      memb();
    }, [channel_data.channel_id]);

    const handleInput = (e) => {
      if (e.code === "Enter") {
        handleSearch();
      }
    };

    const handleSearch = async () => {
      setfetchdone(false);
      const currentmembers = await fetchchannelmember(channel_data.channel_id);
      const currentmems = currentmembers[0].channel_members;
      const matcheds = currentmems.filter(
        (currentmem) =>
          currentmem.member_name.toLowerCase().includes(username.toLowerCase()) //case insensitive search
      );
      const detailedMembers = await Promise.all(
        matcheds.map(async (memberId) => {
          try {
            const memberDetails = await Getuserdetails(memberId.member_id);
            return memberDetails;
          } catch (error) {
            console.error(error);
            return null;
          }
        })
      );
      setMembers(detailedMembers.filter(Boolean)); //removes null data
      setfetchdone(true);
    };

    const threedotselect = (memberId) => {
      setSelectedMemberId(memberId === selectedMemberId ? null : memberId);
    };

    const addasadmin = async (memberid) => {
      try {
        const allids = await allidsinlist();
        for (const Id of allids) {
          const userChannels = await fetchUserchannelsbyid(Id.id);
          if (userChannels.length > 0) {
            const index = userChannels.findIndex(
              (channel) => channel.channel_id === channel_data.channel_id
            );
            if (index !== -1) {
              const channelToUpdate = userChannels[index]; //we change the data in the channel data whose index matches to the channel id we are using currently
              const updatedAdminIds = [
                ...channelToUpdate.channelinfo.adminid,
                { id: memberid },
              ];
              channelToUpdate.channelinfo.adminid = updatedAdminIds;
              userChannels[index] = channelToUpdate;
              const updatedUserChannels = await updatechannel(
                Id.id,
                userChannels
              );

              console.log(
                "Updated userChannels in database:",
                updatedUserChannels
              );
            }
          }
        }
      } catch (error) {
        console.error("Error adding admin:", error);
      }
    };

    const deleteasadmin = async (memberid) => {
      try {
        if (memberid === channel_data.channelinfo.createdbyid) {
          console.log("Cannot delete the creator as admin.");
          return;
        }
        const allids = await allidsinlist();
        for (const Id of allids) {
          const userChannels = await fetchUserchannelsbyid(Id.id);
          if (userChannels.length > 0) {
            const index = userChannels.findIndex(
              (channel) => channel.channel_id === channel_data.channel_id
            );
            if (index !== -1) {
              const channelToUpdate = userChannels[index];
              const updatedAdminIds =
                channelToUpdate.channelinfo.adminid.filter(
                  //getting all ids that are not to be deleted
                  (admin) => admin.id !== memberid
                );
              channelToUpdate.channelinfo.adminid = updatedAdminIds;

              userChannels[index] = channelToUpdate;
              const updatedUserChannels = await updatechannel(
                Id.id,
                userChannels
              );

              console.log(
                "Updated userChannels in database:",
                updatedUserChannels
              );
            }
          }
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
      }
    };

    const Removemember = async (memberid) => {
      try {
        if (channel_data.channeladmins.some((admin) => admin.id === memberid)) {
          const allids = await allidsinlist();
          for (const Id of allids) {
            const userChannels = await fetchUserchannelsbyid(Id.id);
            if (userChannels.length > 0) {
              const index = userChannels.findIndex(
                (channel) => channel.channel_id === channel_data.channel_id
              );
              if (index !== -1) {
                const channelToUpdate = userChannels[index];
                const updatedAdminIds =
                  channelToUpdate.channelinfo.adminid.filter(
                    //getting all ids that are not to be deleted
                    (admin) => admin.id !== memberid
                  );
                channelToUpdate.channelinfo.adminid = updatedAdminIds;

                userChannels[index] = channelToUpdate;
                const updatedUserChannels = await updatechannel(
                  Id.id,
                  userChannels
                );

                console.log(
                  "Updated userChannels in database:",
                  updatedUserChannels
                );
              }
            }
          }
        }
        const members = await fetchUserchannelmembers(channel_data.channel_id);
        const updatedmem = members.filter((mem) => mem.member_id != memberid);
        const memresult = insertchannelmember(
          channel_data.channel_id,
          updatedmem
        );
        const channelscurrent = await fetchUserchannelsbyid(memberid);
        console.log(channelscurrent);
        const updatedchannel = channelscurrent.filter(
          (channel) => channel.channel_id !== channel_data.channel_id
        );

        const chanresult = await updatechannel(memberid, updatedchannel);
      } catch (error) {
        console.error("Error removing member:", error);
      }
    };

    const admincheck = (memberid) => {
      if (!loadadmincheck && !fetchchannelupdate) {
        return (
          isAdmin &&
          !channel_data.channeladmins.some((admin) => admin.id === memberid)
        );
      }
    };

    return (
      <>
        {" "}
        {channel_data && channel_data.channelinfo ? (
          <div className={channelmembersCSS.body}>
            <div className={channelmembersCSS.box}>
              <div className={channelmembersCSS.head}>
                <h1 className={channelmembersCSS.h1}>Members of Channel</h1>
                <ImCross
                  size={16}
                  onClick={() => {
                    setShowmembers(false);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <div className={channelmembersCSS.inputbox}>
                <input
                  type="text"
                  className={channelmembersCSS.input}
                  placeholder="Search for a member"
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleInput}
                />
              </div>
              <div className={channelmembersCSS.memberslist}>
                {fetchdone && members.length > 0 ? (
                  members.map((member) => (
                    <div
                      key={member[0]?.id}
                      className={channelmembersCSS.member}
                    >
                      {member ? (
                        <>
                          <img
                            src={member[0]?.avatar_url}
                            alt={member[0]?.username}
                            className={channelmembersCSS.memimg}
                          />
                          <div className={channelmembersCSS.meminfo}>
                            <span className={channelmembersCSS.infospan1}>
                              {member[0]?.username}
                            </span>
                            <span className={channelmembersCSS.infospan2}>
                              {member[0]?.email}
                            </span>
                            {selectedMemberId === member[0]?.id && (
                              <div className={channelmembersCSS.options}>
                                <div className={channelmembersCSS.option}>
                                  <p>Direct Message</p>
                                </div>
                                {isAdmin ? (
                                  admincheck(member[0].id) ? (
                                    <>
                                      <div
                                        className={channelmembersCSS.option}
                                        onClick={(e) =>
                                          addasadmin(member[0].id)
                                        }
                                      >
                                        <p>Add as admin</p>
                                      </div>
                                      <div
                                        className={channelmembersCSS.option}
                                        onClick={(e) =>
                                          Removemember(member[0].id)
                                        }
                                      >
                                        <p>Remove</p>
                                      </div>
                                    </>
                                  ) : channel_data.channelinfo.createdbyid ===
                                    member[0].id ? (
                                    <></>
                                  ) : (
                                    <>
                                      <div
                                        className={channelmembersCSS.option}
                                        onClick={(e) =>
                                          deleteasadmin(member[0].id)
                                        }
                                      >
                                        <p>Delete as admin</p>
                                      </div>
                                      <div
                                        className={channelmembersCSS.option}
                                        onClick={(e) =>
                                          Removemember(member[0].id)
                                        }
                                      >
                                        <p>Remove</p>
                                      </div>
                                    </>
                                  )
                                ) : (
                                  <></>
                                )}
                              </div>
                            )}
                          </div>
                          <BsThreeDotsVertical
                            onClick={() => threedotselect(member[0]?.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </>
                      ) : (
                        <p>Error fetching details</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Searching....</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </>
    );
  } else {
    return <></>;
  }
};

export default Showmembers;
