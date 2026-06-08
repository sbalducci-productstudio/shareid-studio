import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { SessionProvider } from "./session.jsx";

createRoot(document.getElementById("root")).render(
  <SessionProvider>
    <App />
  </SessionProvider>
);
