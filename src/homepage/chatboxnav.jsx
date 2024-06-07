import { useContext, useEffect, useState } from "react";
import { UserdetailsbyName } from "../database";
import chatboxnavCSS from "./chatboxnav.module.css";
import { Allconvers } from "../context api/context";
import supabase from "../supabase";
import { fetchUserDmChats } from "../database";
import { Chatcontext } from "../context api/chatcontext";
import { Chats } from "./chats.jsx";

export default function Searchuser({ currentUser, setconupdate }) {
  const { Dm, setDm } = useContext(Allconvers);
  const [Username, setUsername] = useState("");
  const [user, setUser] = useState(null); // Initialize with null
  const [dmopen, setDmopen] = useState(false);
  const [currentuserdm_chats, setcurrentuserdm_chats] = useState([]);
  const [userdm_chats, setuserdm_chats] = useState([]);
  const [clickeduser, setClickeduser] = useState("");
  const [combinedId, setcombinedId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false); // Flag to track update process
  const {dispatch}=useContext(Chatcontext)

  useEffect(() => {
    console.log("dm stored current", currentuserdm_chats);
    console.log("dm stored user", userdm_chats);
    console.log(combinedId);
  }, [combinedId, currentuserdm_chats, userdm_chats]);

  // Handle search input and fetch user details
  const handleSearch = async () => {
    const fetchedUser = await UserdetailsbyName(Username);

    if (fetchedUser && fetchedUser.length > 0) {
      setUser(fetchedUser);
    } else {
      setUser(null); // Set user to null to display "No User Found"
    }
  };

  // Trigger search on Enter key press
  const handleInput = (e) => {
    if (e.code === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (clickeduser) {
      const combinedid =
        clickeduser.id > currentUser.id
          ? clickeduser.id + currentUser.id
          : currentUser.id + clickeduser.id;
      setcombinedId(combinedid);

      (async () => {
        setIsUpdating(true); // Set update flag to true
        try {
          const currdmchat = await fetchUserDmChats(currentUser);
          const usdmchat = await fetchUserDmChats(clickeduser);
          setcurrentuserdm_chats(currdmchat);
          setuserdm_chats(usdmchat);
        } catch (error) {
          console.error("Error fetching dm chats:", error);
        } finally {
          setIsUpdating(false); // Set update flag to false after fetching
        }
      })();
    }
  }, [clickeduser]);
  const handlechatselect=(u)=>{
    dispatch({type:"Change_user" ,payload:u})
  }
  const handleUser = async (user) => {
    setClickeduser(user);
    setUsername("");
    setUser(null);
    setDmopen(true);
    setDm(false);
  };

  useEffect(() => {
    if (combinedId && !isUpdating) {
      const checkCombinedIdExists = (chats) =>
        chats.some((chat) => chat.combinedId === combinedId);

      const currentUserCombinedIdExists =
        checkCombinedIdExists(currentuserdm_chats);
      const selectedUserCombinedIdExists = checkCombinedIdExists(userdm_chats);

      (async () => {
        try {
          // Insert new chat if combined ID doesn't exist in either user's chats
          if (!currentUserCombinedIdExists && !selectedUserCombinedIdExists) {
            const { data, error } = await supabase
              .from("chats_dm")
              .insert([{ id: combinedId, messages: [] }])
              .select();

            if (error) {
              console.error("Error inserting chat:", error);
            } else {
              console.log(data);
            }
          }

          // Update direct messages for current user if combined ID doesn't exist
          if (!currentUserCombinedIdExists) {
            const { data, error } = await supabase
              .from("direct_messages")
              .update({
                dm_chats: [
                  ...currentuserdm_chats,
                  {
                    combinedId: combinedId,
                    userinfo: {
                      uid: clickeduser.id,
                      uusername: clickeduser.username,
                      uemail: clickeduser.email,
                      uphoto: clickeduser.avatar_url,
                    },
                    date: new Date().toISOString(),
                  },
                ],
              })
              .eq("id", currentUser.id)
              .select();

            if (error) {
              console.error("Error updating direct message:", error);
            } else {
              console.log("Message updated successfully current:", data);
              setconupdate(false);
            }
          }

          // Update direct messages for selected user if combined ID doesn't exist
          if (!selectedUserCombinedIdExists) {
            const { data, error } = await supabase
              .from("direct_messages")
              .update({
                dm_chats: [
                  ...userdm_chats,
                  {
                    combinedId: combinedId,
                    userinfo: {
                      uid: currentUser.id,
                      uusername: currentUser.username,
                      uemail: currentUser.email,
                      uphoto: currentUser.avatar_url,
                    },
                    date: new Date().toISOString(),
                  },
                ],
              })
              .eq("id", clickeduser.id)
              .select();

            if (error) {
              console.error("Error updating direct message2:", error);
            } else {
              console.log("Message updated successfully2 user:", data);
              handlechatselect({
                combinedId: combinedId,
                userinfo: {
                  uid: currentUser.id,
                  uusername: currentUser.username,
                  uemail: currentUser.email,
                  uphoto: currentUser.avatar_url,
                },
                date: new Date().toISOString(),
              },)
              setconupdate(false);
            }
          }
        } catch (error) {
          console.error("Unexpected error:", error);
        }
      })();
    }
  }, [combinedId, isUpdating]);
  
  
  return (
    <>
      {dmopen && !Dm ? (
        <Chats />
      ) : (
        <>
          <div className={chatboxnavCSS.searchbar}>
            <div className={chatboxnavCSS.heading}>
              <p>New Message</p>
            </div>
            <div className={chatboxnavCSS.enter}>
              <label htmlFor="to">To:</label>
              <div className={chatboxnavCSS.in}>
                <input
                  type="text"
                  name="to"
                  className={chatboxnavCSS.input}
                  placeholder="Find a User"
                  onKeyDown={handleInput}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className={chatboxnavCSS.chats}>
            {user ? (
              user.map((u) => (
                <div
                  key={u.id}
                  className={chatboxnavCSS.Suserbox}
                  onClick={() => {
                    handleUser(u);
                    setClickeduser(u);
                  }}
                >
                  <div className={chatboxnavCSS.Suserphoto}>
                    <img
                      src={u.avatar_url}
                      alt=""
                      className={chatboxnavCSS.img}
                    />
                  </div>
                  <div className={chatboxnavCSS.Suserinfo}>
                    <p>{u.username}</p>
                    <p>{u.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className={chatboxnavCSS.Suserbox}>
                <div className={chatboxnavCSS.Suserphoto}></div>
                <div className={chatboxnavCSS.Suserinfo}>
                  <p>No User Found</p>
                </div>
              </div>
            )}
            <div className={chatboxnavCSS.textwork}></div>
          </div>
        </>
      )}
    </>
  );
}
