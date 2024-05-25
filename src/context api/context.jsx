import { createContext, useEffect, useState } from "react";
import { Getuserdetails } from "../database"; // Assuming Getuserdetails fetches data correctly

export const Allconvers = createContext({});

export const AllconversProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState([]); // Initialize with an empty string
  const [userId, setUserId] = useState(null); // Initialize with null

  const [isLoading, setIsLoading] = useState(true); // Added loading state

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
          // Handle errors here (optional)
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

  // Expose values to child components
  const contextValues = {
    currentUser,
    setCurrentUser,
    userId,
    setUserId,
    isLoading, // Expose loading state
  };

  return (
    <Allconvers.Provider value={contextValues}>{children}</Allconvers.Provider>
  );
};
