import React from "react";
import { createRoot } from "react-dom/client";
import Header from "./Header";
import MainLogo from "./MainLogo";
import Footer from "./Footer";

const root = createRoot(document.body);
root.render(<App />);

function App() {
  return (
    <div>
      <MainLogo />
      <Header />
      <Footer />
    </div>
  );
}
