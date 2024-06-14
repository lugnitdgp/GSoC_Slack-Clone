import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Pages from "./pages.jsx";
import { BrowserRouter } from "react-router-dom";
import { AllconversProvider } from "./context api/context.jsx";
import { ChatcontextProvider } from "./context api/chatcontext.jsx";
import { ChannelcontextProvider } from "./context api/channelcontext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AllconversProvider>
    <ChatcontextProvider>
      <ChannelcontextProvider>
        <React.StrictMode>
          <BrowserRouter>
            <Pages />
          </BrowserRouter>
        </React.StrictMode>
      </ChannelcontextProvider>
    </ChatcontextProvider>
  </AllconversProvider>
);
