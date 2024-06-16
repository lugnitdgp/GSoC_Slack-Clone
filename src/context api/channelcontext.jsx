import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Allconvers } from "./context";

export const Channelcontext = createContext();

export const ChannelcontextProvider = ({ children }) => {
  const { currentUser } = useContext(Allconvers);

  const INTIAL_STATE = {
    channel_id: "null",
    channel: {},
  };
  const chatReducer = (state, action) => {
    switch (
      action.type //we use Reducer as we can now comfortably deal with complex data types
    ) {
      case "Change_channel":
        return {
          channel: action.payload,
          channeladmins: action.payload.channelinfo.adminid,
          channelname: action.payload.channelname,
          channel_id: action.payload.channel_id,
          channelinfo: action.payload.channelinfo,
          allowshow: action.payload.allowshow,
        };
      default:
        return { state };
    }
  };
  const [state, dispatchchannel] = useReducer(chatReducer, INTIAL_STATE);
  useEffect(() => {
    console.log(state);
  }, [state]);
  // Expose values to child components
  const contextValues = {
    channel_data: state,
    dispatchchannel,
  };

  return (
    <Channelcontext.Provider value={contextValues}>
      {children}
    </Channelcontext.Provider>
  );
};
