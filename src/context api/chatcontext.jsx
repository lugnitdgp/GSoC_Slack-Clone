import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Allconvers } from "./context";

export const Chatcontext = createContext();

export const ChatcontextProvider = ({ children }) => {
  const { currentUser } = useContext(Allconvers);
  console.log(currentUser)
  const INTIAL_STATE = {
    chatId: "null",
    user: {},
  };
  const chatReducer = (state, action) => {
    switch (action.type) {                    //we use Reducer as we can now comfortably deal with complex data types
      case "Change_user":
        return {
          user: action.payload,
          chatId:
            action.payload.uid > currentUser[0].id
              ? action.payload.uid + currentUser[0].id
              : currentUser[0].id + action.payload.uid,
        };
      default:
        return { state };
    }
  };
  const [state, dispatch] = useReducer(chatReducer, INTIAL_STATE);
useEffect(()=>{
  console.log(state)
},[state])
  // Expose values to child components
  const contextValues = {
    data:state,
    dispatch,
  };

  return (
   <Chatcontext.Provider value={contextValues}>
   {children}
   </ Chatcontext.Provider>
  );
};
