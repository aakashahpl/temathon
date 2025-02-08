import { useState } from "react";
import Login from "./Login";  
import MapboxMap from "./MapboxMap";  

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div>
      {isLoggedIn ? <MapboxMap /> : <Login onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}
