import ChatsCSS from "./chats.module.css";
import { useContext, useEffect, useState } from "react";
import { Chatcontext } from "../context api/chatcontext";

export const Chats = () => {
  const { data } = useContext(Chatcontext);
  const [messages, setMessages] = useState([]);
  console.log(data.user);
  useEffect(() => {
    const messages = () => {
      const chatsDm = supabase
        .channel("custom-filter-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chats_dm",
            filter: `id=eq.${data.chatId}`,
          },
          (payload) => {
            console.log("Change received!", payload);
          }
        )
        .subscribe();

      // Cleanup function to unsubscribe from the channel
      return () => {
        supabase.removeChannel(chatsDm);
      };
    };
    messages()
  });
  return (
    <div className={ChatsCSS.chat}>
      <div className={ChatsCSS.chatinfo}>
        <span>{data?.user.uusername}</span>
      </div>
      <div className={ChatsCSS.messages}></div>
      <div className={ChatsCSS.textinput}></div>
    </div>
  );
};
