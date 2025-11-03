import React from "react";
import { createRoot } from "react-dom/client";
import Header from "./Header";

const root = createRoot(document.body);
root.render(<App />);

function App() {
  return (
    <div>
      <Header />
    </div>
  );
}
