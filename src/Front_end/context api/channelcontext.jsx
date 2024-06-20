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
  const {
    currentUser,
    loadadmincheck,
    setloadadmincheck,
    setchat,
    setConformdm,
    setDm,
    setChannelchat,
  } = useContext(Allconvers);
  const [load, setload] = useState(false);
  const INTIAL_STATE = {
    channel_id: "null",
    channel: {},
  };
  const chatReducer = (state, action) => {
    switch (
      action.type //we use Reducer as we can now comfortably deal with complex data types
    ) {
      case "Change_channel":
        if (action.payload?.channelinfo) {
          return {
            channel: action.payload,
            channeladmins: action.payload.channelinfo.adminid,
            channelname: action.payload.channelname,
            channel_id: action.payload.channel_id,
            channelinfo: action.payload.channelinfo,
            allowshow: action.payload.allowshow,
            addedby: action.payload.addedby,
          };
        } else {
          return;
        }
      case "ADMIN_UPDATE":
        return {
          ...state,
          channelinfo: {
            ...state.channelinfo,
            adminid: action.payload, // Update admin IDs here
          },
          channeladmins: action.payload,
        };

      default:
        return { state };
    }
  };
  const [state, dispatchchannel] = useReducer(chatReducer, INTIAL_STATE);
  useEffect(() => {
    setloadadmincheck(false);
    setload(true);
    console.log(state);
  }, [state]);
  useEffect(() => {
    setloadadmincheck(false);
    setload(false);
  }, [load]);
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
