import { createContext, useEffect, useState } from "react";
import { Getuserdetails } from "../database"; // Assuming Getuserdetails fetches data correctly

export const Allconvers = createContext({});

export const AllconversProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState([]); // Initialize with an empty string
  const [userId, setUserId] = useState(null); // Initialize with null
  const [Dm, setDm] = useState(false); // for the direct-messages page management
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [addchannel, setAddchannel] = useState(false);
  const [addchannelmember, setaddchannelmember] = useState(false);
  const [showmembers, setShowmembers] = useState(false);
  const [addusericon, setaddusericon] = useState(false);
  const [loadadmincheck, setloadadmincheck] = useState(false);
  const [chat, setchat] = useState(false);
  const [confirmdm, setConformdm] = useState(false);
  const [channelchat, setChannelchat] = useState(false);
  const [selectedchannel, setselectedchannel] = useState([{}]);
  // Fetch user data once on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true); // Set loading to true
      if (userId) {
        try {
          const user = await Getuserdetails(userId);
          if (user && user.length > 0) {
            console.log("Fetched User ID:", user[0].id);
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Handle errors here
        }
      }
      setIsLoading(false); // Set loading to false
    };

    fetchUserData();
  }, [userId]); // Run effect only when userId changes

  // Log currentUser whenever it changes
  useEffect(() => {
    console.log("Current User State Updated:", currentUser);
  }, [currentUser]);

  // All values to child components
  const contextValues = {
    addchannelmember,
    setaddchannelmember,
    currentUser,
    setCurrentUser,
    userId,
    setUserId,
    isLoading,
    Dm,
    setDm,
    addchannel,
    setAddchannel,
    showmembers,
    setShowmembers,
    addusericon,
    setaddusericon,
    loadadmincheck,
    setloadadmincheck,
    chat,
    setchat,
    confirmdm,
    setConformdm,
    channelchat,
    setChannelchat,
    selectedchannel,
    setselectedchannel,
  };

  return (
    <Allconvers.Provider value={contextValues}>{children}</Allconvers.Provider>
  );
};
