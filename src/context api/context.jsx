import { createContext, useEffect, useState } from "react";
import { Getuserdetails } from "../database"; // Assuming Getuserdetails fetches data correctly

export const Allconvers = createContext({});

export const AllconversProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Initialize with null
  const [userId, setUserId] = useState({}); // Initialize with null

  // Fetch user data once on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        // Check if userId is valid before fetching
        const user = await Getuserdetails(userId);
        console.log(user[0]);
        setCurrentUser(user); // Update currentUser only if successful
      }
    };

    fetchUserData();
  }, [userId]); // Run effect only when userId changes

  // Expose values to child components
  const contextValues = {
    currentUser,
    setCurrentUser,
    userId,
    setUserId,
  };

  return (
    <Allconvers.Provider value={contextValues}>{children}</Allconvers.Provider>
  );
};
