import {
  Getuserdetails,
  idm,
  fetchUserDmChats,
  fetchUsermessages,
  insertidforchannel,
} from "../database";
import { useState, useEffect, useContext } from "react";
import supabase from "../supabase";
import homepaseCSS from "./homepage.module.css";
import { FaEdit } from "react-icons/fa";
import Searchuser from "./dm chats/chatboxnav";
import { FaPowerOff } from "react-icons/fa6";
import { Allconvers } from "../context api/context";
import { Chatcontext } from "../context api/chatcontext";
import { Chats } from "./dm chats/chats";
import Addchannel from "./channels/addchannel";

function Home(data) {
  const { setUserId, currentUser, userId, Dm, setDm,setAddchannel,addchannel } = useContext(Allconvers);
  const { dispatch } = useContext(Chatcontext);
  const [isLoading, setIsLoading] = useState(true); // Use state to manage loading
  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const [confirmdm, setConformdm] = useState(false);
  const [dmcontacts, setDmcontacts] = useState([]);
  const [chat, setchat] = useState(false);
  const [fetchdmupdate, setFetchdmupdate] = useState(false);
  const [condisplay, setCondisplay] = useState(false);

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

  useEffect(() => {
    const insertdm = async () => {
      const idm0 = await idm(userId);
      const idforchanneldata = await insertidforchannel(userId);
      console.log(idm0);
      console.log(idforchanneldata);
    };
    insertdm();
  }, [userId]);

  async function signout() {
    try {
      let { error } = await supabase.auth.signOut();

      if (error) {
        console.log(error);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("mailcheck");
        window.location.reload();
        alert("successfully logged out");
      }
    } catch (error) {
      console.log(error);
    }
  }

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
    data.data.user.id && dmchats();
  }, [data.data.user.id]);

  const handlechatselect = (u) => {
    dispatch({ type: "Change_user", payload: u }); //we change the reducer state
  };

  return (
    <>
    {addchannel?<Addchannel />:<></>}
      {isLoading ? (
        <h1>Loading...</h1> // Display loading message while fetching
      ) : (
        <div className={homepaseCSS.whole}>
          <div className={homepaseCSS.box}>
            <div className={homepaseCSS.top}>
              <div className={homepaseCSS.search}></div>
              <div className={homepaseCSS.logo}></div>
            </div>
            <div className={homepaseCSS.bottom}>
              <div className={homepaseCSS.sidebar}>
                <div className={homepaseCSS.right}>
                  <div className={homepaseCSS.userdetails}>
                    <div className={homepaseCSS.userleft}>
                      <p className={homepaseCSS.NaMe}>{name}</p>
                    </div>
                    <div className={homepaseCSS.userright}>
                      <FaEdit
                        className={homepaseCSS.faedit}
                        size={23}
                        color="white"
                      />
                    </div>
                  </div>
                  <div className={homepaseCSS.community}>
                    <div className={homepaseCSS.hashes}>
                      <button
                        className={homepaseCSS.addchannel}
                        onClick={(s) => {
                          setAddchannel(true)
                          console.log(addchannel)
                          
                        }}
                      >
                        Add Channels
                      </button>
                    </div>
                    <div className={homepaseCSS.contacts}>
                      <button
                        className={homepaseCSS.dm}
                        onClick={(s) => {
                          setDm(true);
                          setConformdm(true);
                        }}
                      >
                        Direct message
                      </button>

                      {Object.entries(dmcontacts)?.map((contact) => (
                        <div
                          className={homepaseCSS.sdmcontact}
                          key={contact[1].combinedId}
                          onClick={() => {
                            console.log(contact[1].userinfo);
                            handlechatselect(contact[1].userinfo);
                            setchat(true);
                            setConformdm(false);
                            setDm(false);
                          }}
                          style={{
                            display:
                              contact[1].showstatus === true ? "flex" : "none",
                          }}
                        >
                          <img
                            src={contact[1]?.userinfo?.uphoto}
                            alt=""
                            className={homepaseCSS.sdmimg}
                          />
                          <div className={homepaseCSS.sdmcontactinfo}>
                            <>
                              <span className={homepaseCSS.sdmcontactname}>
                                {contact[1]?.userinfo?.uusername}
                              </span>
                              <span className={homepaseCSS.sdmcontactmail}>
                                {contact[1]?.userinfo?.uemail}
                              </span>
                            </>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={homepaseCSS.left}>
                  <div className={homepaseCSS.allcom}>
                    <FaPowerOff
                      size={30}
                      color="white"
                      className={homepaseCSS.poweroff}
                      onClick={() => signout()}
                    />
                  </div>
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
    </>
  );
}

export default Home;
