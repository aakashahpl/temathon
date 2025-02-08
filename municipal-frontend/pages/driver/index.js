"use client";
import React, { useEffect, useState } from "react";
import MunicipalMap from "@/components/DriverMapBox";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function Municipal() {
  const router = useRouter();

  const [truck, setTruck] = useState(null);
  const [dustbins, setDustbins] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [activeDustbin, setActiveDustbin] = useState(null);

  // Fetch truck and dustbin data once
  useEffect(() => {
    fetch("http://localhost:4200/truck/getTruck/15") // Change to your real endpoint
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Truck fetched successfully." && data.data) {
          const truckData = data.data;
          setTruck(truckData);

          // If truck has dustbin_ids, fetch those dustbins
          if (truckData.dustbin_ids) {
            fetch("http://localhost:4200/dustbin/fetchMany", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dustbin_ids: truckData.dustbin_ids }),
            })
              .then((res) => res.json())
              .then((dustbinData) => {
                if (dustbinData.message === "Dustbins fetched successfully.") {
                  // Initialize dustbins with "pending" status
                  const binsWithStatus = dustbinData.data.map((bin) => ({
                    ...bin,
                    status: "pending",
                  }));
                  setDustbins(binsWithStatus);
                }
              })
              .catch((error) => console.error("Error fetching dustbins:", error));
          }
        }
      })
      .catch((error) => console.error("Error fetching truck data:", error));
  }, []);

  // Called by child when the truck is near a dustbin
  const handleDustbinReached = (dustbinId) => {
    setIsPaused(true);
    setActiveDustbin(dustbinId); // Show popup in sidebar
  };

  // Mark dustbin as completed or missed
  const handleUpdateDustbinStatus = (status) => {
    if (!activeDustbin) return;
    setDustbins((prev) =>
      prev.map((d) => (d.id === activeDustbin ? { ...d, status } : d))
    );
    setActiveDustbin(null);
    setIsPaused(false);
  };

  const handleLogout = () => {
    // Example logout
    router.push("/");
  };

  return (
    // Full-screen container so map is visible
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">Driver Dashboard</h2>

          <h3 className="text-lg mb-4">Dustbins</h3>

          {/* Popup to mark dustbin as completed/missed */}
          {activeDustbin && (
            <div className="mt-6 p-3 bg-gray-800 rounded">
              <p className="mb-2">Dustbin #{activeDustbin} reached. Choose an action:</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateDustbinStatus("completed")}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Complete
                </Button>
                <Button
                  onClick={() => handleUpdateDustbinStatus("missed")}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Missed
                </Button>
              </div>
            </div>
          )}

          {/* Dustbin list with scrolling */}
          <ul className="space-y-4 h-96 overflow-scroll mt-4">
            {dustbins.map((bin) => (
              <li
                key={bin.id}
                className={`p-3 rounded-lg ${
                  bin.status === "completed"
                    ? "bg-green-600"
                    : bin.status === "missed"
                    ? "bg-red-600"
                    : "bg-gray-800"
                }`}
              >
                <p className="mb-1 font-bold">Dustbin ID: {bin.id}</p>
                <p className="mb-2 capitalize">Status: {bin.status}</p>
              </li>
            ))}
          </ul>
        </div>

        <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700">
          Logout
        </Button>
      </div>

      {/* Map Section */}
      <div className="flex-1">
        <MunicipalMap
          truck={truck}
          dustbins={dustbins}
          isPaused={isPaused}
          onDustbinReached={handleDustbinReached}
        />
      </div>
    </div>
  );
}
