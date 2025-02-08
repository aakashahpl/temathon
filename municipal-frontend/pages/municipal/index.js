"use client";
import React, { useState, useRef } from "react";
import MapboxMap from "@/components/MapboxMap";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Sidebar = () => {
  const [currentTruck, setCurrentTruck] = useState(0); // State to track selected truck
  const mapRef = useRef(null); // Reference to Mapbox map for moving to Transfer Station
	const router = useRouter();

  const handleTruckChange = (option, value) => {
    setCurrentTruck(value); // Set state to 0 (all), 1 (truck 1), or 2 (truck 2)
  };

  const handleMoveToTransferStation = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [80.100612, 12.936010],
        zoom: 16,
        essential: true, // Smooth animation
      });
    }
  };

  const handleLogout = () => {
    alert("You have logged out!");
    router.push('/');
    // Optionally, redirect to login page or handle logout logic here
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-2/12 bg-gray-900 text-white h-screen p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

          {/* Dropdown for Truck Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full bg-gray-700 text-white hover:bg-gray-600">
                Trucks: {currentTruck === 0 ? "All" : `Truck ${currentTruck}`}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-white text-black w-full">
              <DropdownMenuItem
                onClick={() => handleTruckChange("All", 0)}
                className="hover:bg-gray-200"
              >
                All Trucks
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTruckChange("Truck 1", 1)}
                className="hover:bg-gray-200"
              >
                Truck 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTruckChange("Truck 2", 2)}
                className="hover:bg-gray-200"
              >
                Truck 2
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Transfer Station Button */}
          <Button
            onClick={handleMoveToTransferStation}
            className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            Transfer Station
          </Button>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="bg-red-600 w-full text-white hover:bg-red-700 mt-auto"
        >
          Logout
        </Button>
      </div>

      {/* Mapbox Map */}
      <div className="flex-1">
        <MapboxMap currentTruck={currentTruck} mapRef={mapRef} />
      </div>
    </div>
  );
};

export default Sidebar;
