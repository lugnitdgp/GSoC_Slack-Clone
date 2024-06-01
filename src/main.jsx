import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Pages from "./pages.jsx";
import supabase from "./supabase.jsx";
import { BrowserRouter } from "react-router-dom";
import { AllconversProvider } from "./context api/context.jsx";
import { ChatcontextProvider } from "./context api/chatcontext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AllconversProvider>
    <ChatcontextProvider>
    <React.StrictMode>
      <BrowserRouter>
        <Pages />
      </BrowserRouter>
    </React.StrictMode>
    </ChatcontextProvider>
  </AllconversProvider>
);