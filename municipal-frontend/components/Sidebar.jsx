"use client";
import React, { useState } from "react";
import MapboxMap from "./MapboxMap";
const Sidebar = () => {
  const [currentTruck, setCurrentTruck] = useState(0); // State to track selected truck

  const handleTruckChange = (option, value) => {
    setCurrentTruck(value); // Set state to 0 (all), 1 (truck 1), or 2 (truck 2)
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Truck Control</h2>

        {/* Dropdown Button */}
        <div className="relative">
          <button
            className="w-full text-left px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none"
          >
            Trucks: {currentTruck === 0 ? "All" : `Truck ${currentTruck}`}
          </button>

          <div className="mt-2 border rounded-lg shadow-md bg-white text-black">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              onClick={() => handleTruckChange("All", 0)}
            >
              All Trucks
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              onClick={() => handleTruckChange("Truck 1", 1)}
            >
              Truck 1
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              onClick={() => handleTruckChange("Truck 2", 2)}
            >
              Truck 2
            </button>
          </div>
        </div>
      </div>

      {/* Mapbox Map */}
      <div className="flex-1">
        <MapboxMap currentTruck={currentTruck} />
      </div>
    </div>
  );
};

export default Sidebar;
