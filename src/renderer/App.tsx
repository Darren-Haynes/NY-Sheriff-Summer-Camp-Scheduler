import React from "react";
import { createRoot } from "react-dom/client";
import Header from "./Header";
import MainLogo from "./MainLogo";

const root = createRoot(document.body);
root.render(<App />);

function App() {
  return (
    <div>
      <MainLogo />
      <Header />
    </div>
  );
}
