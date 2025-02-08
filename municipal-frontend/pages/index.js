import { useState } from "react";
import Login from "./Login";  
import MapboxMap from "../components/MapboxMap";  
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div>
      {/* <Login onLoginSuccess={handleLoginSuccess} /> */}
      <Sidebar/>
    </div>
  );
}
