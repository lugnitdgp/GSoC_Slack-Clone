import {
  Getuserdetails,
  idm,
  fetchUserDmChats,
  fetchUsermessages,
  fetchUserchannels,
  insertidforchannel,
  fetchchannelmember,
  insert_todoid,
} from "../database";
import { useState, useEffect, useContext, useRef } from "react";
import supabase from "../supabase";
import homepaseCSS from "./homepage.module.css";
import { FaEdit } from "react-icons/fa";
import Searchuser from "./dm chats/chatboxnav";
import { FaPowerOff } from "react-icons/fa6";
import { Allconvers } from "../context api/context";
import { Chatcontext } from "../context api/chatcontext";
import { Chats } from "./dm chats/chats";
import Addchannel from "./channels/addchannel";
import { FaSlackHash } from "react-icons/fa";
import { Channelchats } from "./channels/channelchat";
import { Channelcontext } from "../context api/channelcontext";
import Addmember from "./channels/addchannelmember";
import Showmembers from "./channels/membersofchannel";
import Assigntask from "./ToDo_list/assigntask";
import Viewchanneltask from "./ToDo_list/viewchanneltask";
import { MdAssignmentAdd } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import Viewutask from "./ToDo_list/viewusertask";
import Assigntaskself from "./ToDo_list/mytododlist";
import TodoListChanges from "../Mailing/mailsender";
import Totalsearch from "./Totalsearch/totalsearch";
import Googlecalendar from "./googlecalendar/googlecalendar";
import { FaCalendarAlt } from "react-icons/fa";
import { SiGooglecalendar } from "react-icons/si";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { Navigate } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { FiLogOut } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import Profile from "./profile";
import Loader from "../loader";
function Home(data) {
  const {
    profile,
    setprofile,
    setUserId,
    currentUser,
    userId,
    addchannel,
    addchannelmember,
    showmembers,
    setAddchannel,
    setShowmembers,
    loadadmincheck,
    setChannelchat,
    setDm,
    setConformdm,
    channelchat,
    Dm,
    confirmdm,
    chat,
    fetchchannelupdate,
    setFetchchannelupdate,
    setchat,
    assigntask,
    setAssigntask,
    viewchanneltasks,
    viewtask,
    setViewtask,
    assigntaskself,
    setassigntaskself,
    opencalendarevents,
    setopencalendarevents,
    loader,
    setloader,
  } = useContext(Allconvers);
  const { dispatch } = useContext(Chatcontext);
  const { channel_data, dispatchchannel } = useContext(Channelcontext);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const [dmcontacts, setDmcontacts] = useState([]);
  const [fetchdmupdate, setFetchdmupdate] = useState(false);
  const [currentuserchannels, setCurrentuserchannels] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userStatus, setUserStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const specific_user = await Getuserdetails(data.data.user.id);
      setIsLoading(false);
      if (specific_user) {
        setName(specific_user[0].username);
        setPhno(specific_user[0].phone);
        setUserId(specific_user[0].id);
        console.log(currentUser);
      } else {
        console.log("No user found."); //initial data fetching
      }
    };
    const fetchdmdata = async () => {
      const dmcontactinfo = await fetchUserDmChats(data.data.user);
      if (dmcontactinfo) {
        console.log("dmchatinfo:", dmcontactinfo);
        setDmcontacts(dmcontactinfo);
        console.log("dmchatinfo2:", dmcontacts);
      }
    };
    const fetchchannel = async () => {
      const user = await fetchUserchannels(data.data.user);
      if (user) {
        setCurrentuserchannels(user);
        console.log(currentuserchannels);
      }
    };
    fetchchannel();
    fetchData();
    fetchdmdata();
  }, [data]);

  useEffect(() => {
    const fetchdmdata = async () => {
      if (fetchdmupdate) {
        const dmcontactinfo = await fetchUserDmChats(data.data.user); //here fetching the dm contacts data again after we recieve a response
        if (dmcontactinfo) {
          //that there is change in the contacts through the channels
          console.log("dmchatinfo:", dmcontactinfo);
          setDmcontacts(dmcontactinfo);
          console.log("dmchatinfo2:", dmcontacts);
          setFetchdmupdate(false);
        }
      }
    };
    fetchdmdata();
  }, [fetchdmupdate]);

  // Fetch online status for all dmcontacts once on component mount
  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses = {};

      const fetchAllStatuses = Object.values(dmcontacts).map(
        async (contact) => {
          const { data, error } = await supabase
            .from("user_data")
            .select("online_status")
            .eq("id", contact.userinfo.uid)
            .single();

          if (!error && data) {
            statuses[contact.userinfo.uid] = data.online_status;
          }
        }
      );

      await Promise.all(fetchAllStatuses);
      setUserStatus(statuses);
    };

    if (dmcontacts && Object.keys(dmcontacts).length > 0) {
      fetchStatuses();
    }
  }, [dmcontacts]);

  useEffect(() => {
    const fetchchannel = async () => {
      const user = await fetchUserchannels(currentUser[0]);
      console.log(user);

      if (user) {
        setCurrentuserchannels(user);
        console.log(currentuserchannels);
        setFetchchannelupdate(false);
      }
    };
    fetchchannel();
  }, [fetchchannelupdate, loadadmincheck]);

  useEffect(() => {
    const insertdm = async () => {
      setloader(true);
      const idm0 = await idm(userId);
      const idforchanneldata = await insertidforchannel(userId);
      const todoidinsert = await insert_todoid(userId);
      setloader(false);
      console.log(idm0);
      console.log(idforchanneldata);
      console.log(todoidinsert);
    };
    insertdm();
  }, [userId]);

  async function signout() {
    try {
      setloader(true);
      const userId = supabase.auth.user()?.id; // Get the current user ID

      // Update online_status to false in the database
      const { error: statusError } = await supabase
        .from("user_data")
        .update({ online_status: false })
        .eq("id", userId);

      if (statusError) {
        console.log("Error updating status:", statusError);
      }

      // Proceed to sign out after updating online status
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.log(signOutError);
      } else {
        setloader(false);
        // localStorage.removeItem("token");
        localStorage.removeItem("mailcheck");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  }

  // try this useeffect in your local setup
  // useEffect(() => {
  //   const { data: authListener } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       if (event === "SIGNED_OUT" || !session) {
  //         const userId = supabase.auth.user()?.id;

  //         // Update online_status to false on session expiration
  //         if (userId) {
  //           await supabase
  //             .from("user_data")
  //             .update({ online_status: false })
  //             .eq("id", userId);
  //         }
  //       }
  //     }
  //   );

  //   return () => {
  //     authListener?.unsubscribe();
  //   };
  // }, []);

  useEffect(() => {
    const dmchats = () => {
      const channel = supabase
        .channel("currentdmchats-channel") //to listen to the real time changes in the dm contacts and i also tried updating the contacts
        .on(
          //by using the new payload we get but i faced a lag in the time to change the state after the payload
          "postgres_changes", //is recieved but got errors so i instead used a state to get like a signal that there is contact
          {
            //added and then again fetched the contact details again
            event: "*",
            schema: "public",
            table: "direct_messages",
            select: "dm_chats",
            filter: `id=eq.${data.data.user.id}`,
          },
          (payload) => {
            setFetchdmupdate(true);
            console.log("Change received!", payload);
          }
        )
        .subscribe();

      // Cleanup function to unsubscribe from the channel
      return () => {
        supabase.removeChannel(channel);
      };
    };
    const channellisten = () => {
      const channel = supabase
        .channel("currentchannel_list") //to listen to the real time changes in the dm contacts and i also tried updating the contacts
        .on(
          //by using the new payload we get but i faced a lag in the time to change the state after the payload
          "postgres_changes", //is recieved but got errors so i instead used a state to get like a signal that there is contact
          {
            //added and then again fetched the contact details again
            event: "*",
            schema: "public",
            table: "channels_list",
            select: "channels",
            filter: `id=eq.${data.data.user.id}`,
          },
          (payload) => {
            setFetchchannelupdate(true);
            console.log("Change received!", payload);
          }
        )
        .subscribe();

      // Cleanup function to unsubscribe from the channel
      return () => {
        supabase.removeChannel(channel);
      };
    };
    data.data.user.id && dmchats();
    data.data.user.id && channellisten();
  }, [data.data.user.id]);

  const handlechatselect = (u) => {
    setloader(true);
    dispatch({ type: "Change_user", payload: u }); //we change the reducer state
    setloader(false);
  };
  const handlechannelselect = (u) => {
    setloader(true);
    dispatchchannel({ type: "Change_channel", payload: u }); //we change the reducer state
    setloader(false);
  };
  useEffect(() => {
    console.log(currentuserchannels);
  }, [currentuserchannels]);

  const calendarAuth = async () => {
    try {
      setloader(true);
      const response = await fetch(
        `${import.meta.env.VITE_Backend_URL}/api/googleauth`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("OAuth Response:", data);
        setloader(false);
        window.location.href = data.url; // Redirect to OAuth2 authentication URL
      } else {
        console.error("Failed to initiate OAuth:", response.statusText);
        alert("Error:try again");
        setloader(false);
      }
    } catch (error) {
      console.error("Error initiating OAuth:", error);
    }
  };
  const toggleDropdown = () => {
    setloader(true);
    setDropdownOpen(!dropdownOpen);
    setloader(false);
  };

  const handleDMClick = (contact) => {
    setloader(true);
    console.log(contact.userinfo);
    handlechatselect(contact.userinfo);
    setchat(true);
    setConformdm(false);
    setDm(false);
    setChannelchat(false);
    setloader(false);
    //  setDropdownOpen(false);
  };
  const [addChannelOpen, setAddChannelOpen] = useState(false);

  const toggleAddChannel = () => {
    setloader(true);
    setAddChannelOpen(!addChannelOpen);
    setloader(false);
  };

  const handleChannelClick = (channel) => {
    setloader(true);
    handlechannelselect(channel);
    setchat(false);
    setConformdm(false);
    setDm(false);
    setChannelchat(true);
    setloader(false);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (sidebarOpen) {
      sidebarRef.current.classList.add(homepaseCSS.opened);
    } else {
      sidebarRef.current.classList.remove(homepaseCSS.opened);
    }
  };

  const OnlineIndicator = () => {
    return <div className={homepaseCSS.indicatorDot}></div>;
  };

  return (
    <>
      {viewchanneltasks ? <Viewchanneltask /> : <></>}
      {viewtask ? <Viewutask /> : <></>}
      {assigntask ? <Assigntask /> : <></>}
      {assigntaskself ? <Assigntaskself /> : <></>}
      {showmembers ? <Showmembers /> : <></>}
      {opencalendarevents ? <Googlecalendar /> : <></>}
      {addchannelmember ? <Addmember /> : <></>}
      {addchannel ? <Addchannel /> : <></>}
      {profile ? <Profile /> : <></>}
      {loader ? <Loader /> : <></>}
      {isLoading ? (
        <></>
      ) : (
        <div className={homepaseCSS.whole}>
          <div className={homepaseCSS.box}>
            <div className={homepaseCSS.top}>
              <div className={homepaseCSS.logo}>
                <GiHamburgerMenu
                  size={18}
                  className={homepaseCSS.opnsidebar}
                  onClick={toggleSidebar}
                />
              </div>
              <div className={homepaseCSS.search}>
                {currentUser[0]?.id ? <Totalsearch /> : <></>}
              </div>
            </div>
            <div className={homepaseCSS.bottom}>
              <div ref={sidebarRef} className={homepaseCSS.sidebar}>
                <div className={homepaseCSS.right}>
                  <div className={homepaseCSS.userdetails}>
                    <p className={homepaseCSS.NaMe}>{name}</p>
                    {/* <div className={homepaseCSS.userleft}>
                    </div>
                    <div className={homepaseCSS.userright}>
                      <FaEdit
                        className={homepaseCSS.faedit}
                        size={23}
                        color="white"
     
                    </div>
                 */}
                  </div>
                  <div className={homepaseCSS.community}>
                    <div className={homepaseCSS.addChannels}>
                      <div className={homepaseCSS.dropdown1}>
                        <div
                          className={homepaseCSS.dropmenu1}
                          onClick={() => {
                            toggleAddChannel();
                          }}
                        >
                          <RiArrowDropDownLine
                            style={{ color: "#36393b", cursor: "pointer" }}
                            className={
                              addChannelOpen ? "" : homepaseCSS.rotateIcon
                            }
                            size={37}
                          />
                          <h3 className={homepaseCSS.droph31}>Channels</h3>
                        </div>
                        <FaPlus
                          onClick={() => {
                            setAddchannel(true);
                          }}
                          style={{ color: "#606264", cursor: "pointer" }}
                          size={13}
                        />
                      </div>
                      {addChannelOpen && (
                        <div className={homepaseCSS.dropdownMenu}>
                          {Object.entries(currentuserchannels)?.map(
                            (channel) => (
                              <div
                                className={homepaseCSS.schannel}
                                key={channel[1].channel_id}
                                onClick={() => {
                                  handleChannelClick(channel[1]);
                                  toggleSidebar();
                                }}
                              >
                                <div className={homepaseCSS.schannelinfo}>
                                  <FaSlackHash />
                                  <span className={homepaseCSS.schannelname}>
                                    {channel[1]?.channelname}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className={homepaseCSS.directMessages}>
                      <div className={homepaseCSS.dropdown}>
                        <div
                          className={homepaseCSS.dropmenu}
                          onClick={toggleDropdown}
                        >
                          <RiArrowDropDownLine
                            style={{ color: "#36393b", cursor: "pointer" }}
                            className={
                              dropdownOpen ? "" : homepaseCSS.rotateIcon
                            }
                            size={37}
                          />
                          <h3 className={homepaseCSS.droph3}>Direct message</h3>
                        </div>
                        <FaPlus
                          onClick={() => {
                            toggleSidebar();
                            setDm(true);
                            setConformdm(true);
                            setChannelchat(false);
                          }}
                          style={{ color: "#606264", cursor: "pointer" }}
                          size={13}
                        />
                      </div>
                      {dropdownOpen && (
                        <div className={homepaseCSS.dropdownMenu}>
                          {Object.entries(dmcontacts)?.map((contact) => (
                            <div
                              className={homepaseCSS.sdmcontact}
                              key={contact[1].combinedId}
                              onClick={() => {
                                handleDMClick(contact[1]);
                                toggleSidebar();
                              }}
                              style={{
                                display:
                                  contact[1].showstatus === true
                                    ? "flex"
                                    : "none",
                              }}
                            >
                              <img
                                src={contact[1]?.userinfo?.uphoto}
                                alt=""
                                className={homepaseCSS.sdmimg}
                              />
                              <div className={homepaseCSS.sdmcontactinfo}>
                                <span className={homepaseCSS.sdmcontactname}>
                                  {contact[1]?.userinfo?.uusername}
                                </span>
                              </div>
                              {userStatus[contact[1].userinfo.uid] && (
                                <OnlineIndicator />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={homepaseCSS.left}>
                  <div className={homepaseCSS.allcom}>
                    <FiLogOut
                      className={homepaseCSS.sidebaricons}
                      onClick={() => signout()}
                      size={30}
                      style={{ transform: "rotate(180deg)" }}
                    />
                    <FaTasks
                      className={homepaseCSS.sidebaricons}
                      onClick={() => setViewtask(true)}
                      size={30}
                    />
                    <MdAssignmentAdd
                      className={homepaseCSS.sidebaricons}
                      onClick={() => setassigntaskself(true)}
                      size={30}
                    />
                    <SiGooglecalendar
                      className={homepaseCSS.sidebaricons}
                      onClick={calendarAuth}
                      size={30}
                    />
                    <FaCalendarAlt
                      className={homepaseCSS.sidebaricons}
                      onClick={() => setopencalendarevents(true)}
                      size={30}
                    />
                  </div>
                  <CgProfile
                    onClick={() => setprofile(true)}
                    size={35}
                    color="white"
                    style={{ margin: "0 0 30px 16% ", cursor: "pointer" }}
                  />
                </div>
              </div>

              <div className={homepaseCSS.chatbox}>
                {Dm || confirmdm ? (
                  <Searchuser
                    currentUser={currentUser[0]}
                    setdmcontacts={setDmcontacts}
                  />
                ) : chat ? (
                  <Chats />
                ) : channelchat ? (
                  <Channelchats />
                ) : (
                  <>
                    <div className={homepaseCSS.presentcontact}></div>
                    <div className={homepaseCSS.chats}></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <TodoListChanges />
    </>
  );
}

export default Home;
