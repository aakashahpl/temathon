"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { BsTrash3Fill } from "react-icons/bs";
import { FaTruckFront } from "react-icons/fa6";
import { createRoot } from "react-dom/client";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWFrYXNocGF0ZWxhaHBsIiwiYSI6ImNsbWF2MnpkejBkeW8zcGpyNnZsZGs1ancifQ.1CZK6EwQfroKMlUqn1yobA";

const MapboxMap = ({ currentTruck }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationRefs = useRef([]);
  const progressRefs = useRef([0, 0]);
  const routeRefs = useRef([null, null]);
  const markerRefs = useRef([]); // For truck markers

  // Save dustbin markers so we can update them later without removing them.
  const dustbinMarkerRefs = useRef({});

  const [ctoWaypoints, setCtoWaypoints] = useState([]);
  const [vagaiWaypoints, setVagaiWaypoints] = useState([]);

  // Fetch dustbin data and include dustbin id for later use.
  useEffect(() => {
    fetch("http://localhost:4200/dustbin/fetchAll")
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Dustbins fetched successfully.") {
          const ctoBins = data.data
            .filter((bin) => bin.location === "cto")
            .map((bin) => ({
              id: bin.id, // Store id for later reference
              lng: bin.longitude,
              lat: bin.latitude,
              description: `${bin.totalWaste}%`,
              totalWaste: bin.totalWaste,
            }));
          const vagaiBins = data.data
            .filter((bin) => bin.location === "vagai")
            .map((bin) => ({
              id: bin.id,
              lng: bin.longitude,
              lat: bin.latitude,
              description: `${bin.totalWaste}%`,
              totalWaste: bin.totalWaste,
            }));
          setCtoWaypoints(ctoBins);
          setVagaiWaypoints(vagaiBins);
        }
      })
      .catch((error) =>
        console.error("Error fetching dustbin data:", error)
      );
  }, []);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [80.100807, 12.928291],
        zoom: 16.2,
      });

      addCustomMarkers(); // Add static colony markers
    }

    map.current.on("load", () => {
      handleTruckSelection();
    });

    return () => {
      animationRefs.current.forEach((ref) => cancelAnimationFrame(ref));
    };
  }, [ctoWaypoints, vagaiWaypoints]);

  useEffect(() => {
    handleTruckSelection();
  }, [currentTruck]);

  // Add static markers for colonies with labels.
  const addCustomMarkers = () => {
    const colonyMarkers = [
      {
        coords: [80.097830, 12.930755],
        label: "CTO Colony",
      },
      {
        coords: [80.102275, 12.927667],
        label: "Vagai Colony",
      },
    ];

    colonyMarkers.forEach(({ coords, label }) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <div class="text-white bg-orange-300 rounded-md px-3 py-1 shadow-md text-base font-semibold">
          ${label}
        </div>
      `;
      el.className = "marker-label";

      new mapboxgl.Marker()
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${label}</h3>`)
        )
        .addTo(map.current);

      new mapboxgl.Marker(el).setLngLat(coords).addTo(map.current);
    });
  };

  const handleTruckSelection = () => {
    // IMPORTANT: We do not clear dustbin markers here.
    clearPreviousTruckData();

    const colonies = [
      {
        name: "CTO Colony",
        waypoints: ctoWaypoints,
      },
      {
        name: "Vagai Colony",
        waypoints: vagaiWaypoints,
      },
    ];

    colonies.forEach((colony, colonyIndex) => {
      if (currentTruck === 0 || currentTruck === colonyIndex + 1) {
        // Render/update each dustbin marker.
        colony.waypoints.forEach((marker) => {
          // Determine marker color: if already emptied (totalWaste === 0), use blue.
          const markerColor =
            marker.totalWaste === 0 ? "blue" : marker.totalWaste > 50 ? "red" : "green";

          // If the marker already exists, update it.
          if (dustbinMarkerRefs.current[marker.id]) {
            const markerEl = dustbinMarkerRefs.current[marker.id].getElement();
            // Re-render the marker with updated color and description.
            createRoot(markerEl).render(
              <div>
                <BsTrash3Fill size={24} color={markerColor} />
                <div
                  style={{
                    color: "#363636",
                    fontSize: "12px",
                    fontWeight: "bold",
                    background: "white",
                    borderRadius: "4px",
                    padding: "2px",
                  }}
                >
                  {marker.description}
                </div>
              </div>
            );
          } else {
            // Create a new dustbin marker.
            const el = document.createElement("div");
            const binIcon = createRoot(el);
            binIcon.render(
              <div>
                <BsTrash3Fill size={24} color={markerColor} />
                <div
                  style={{
                    color: "#363636",
                    fontSize: "12px",
                    fontWeight: "bold",
                    background: "white",
                    borderRadius: "4px",
                    padding: "2px",
                  }}
                >
                  {marker.description}
                </div>
              </div>
            );
            const dustbinMarker = new mapboxgl.Marker(el)
              .setLngLat([marker.lng, marker.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(
                  `<h3>${marker.description}</h3>`
                )
              )
              .addTo(map.current);
            dustbinMarkerRefs.current[marker.id] = dustbinMarker;
          }
        });

        // For route calculation, use only dustbins with totalWaste > 50.
        const waypointsForRoute = colony.waypoints.filter(
          (marker) => marker.totalWaste > 50
        );
        if (waypointsForRoute.length > 0) {
          fetchOptimizedRoute(waypointsForRoute, "black", colonyIndex);
        }
      }
    });
  };

  // Clear truck markers and route layers (but do not clear dustbin markers).
  const clearPreviousTruckData = () => {
    animationRefs.current.forEach((ref) => cancelAnimationFrame(ref));
    animationRefs.current = [];

    [0, 1].forEach((colonyIndex) => {
      const routeId = `route-${colonyIndex}`;
      if (map.current.getLayer(routeId)) {
        map.current.removeLayer(routeId);
      }
      if (map.current.getSource(routeId)) {
        map.current.removeSource(routeId);
      }
    });

    markerRefs.current.forEach((marker) => {
      if (marker) marker.remove();
    });
    markerRefs.current = [];
    progressRefs.current = [0, 0];
  };

  const fetchOptimizedRoute = async (waypoints, color, colonyIndex) => {
    const coordinates = waypoints
      .map((marker) => `${marker.lng},${marker.lat}`)
      .join(";");
    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}&roundtrip=true`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.trips && data.trips.length > 0) {
        const trip = data.trips[0];
        routeRefs.current[colonyIndex] = trip.geometry.coordinates;
  
        map.current.addSource(`route-${colonyIndex}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeRefs.current[colonyIndex],
            },
          },
        });
  
        map.current.addLayer({
          id: `route-${colonyIndex}`,
          type: "line",
          source: `route-${colonyIndex}`,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": color, // always black
            "line-width": 4,
          },
        });
  
        // Prepare truck assignment data.
        const truckData = {
          truck_id: colonyIndex + 1, // Example: truck ID based on colony index.
          truck_number: `Truck ${colonyIndex + 1}`,
          route_geometry: trip.geometry, // Optimized GeoJSON route.
          current_location: trip.geometry.coordinates[0], // Starting point.
          status: "in transit",
          assigned_colony: colonyIndex === 0 ? "cto" : "vagai",
          route_distance: trip.distance / 1000, // Convert meters to kilometers.
          route_duration: trip.duration, // In seconds.
          dustbin_ids: waypoints.map((marker) => marker.id), // List of dustbin IDs.
        };
  
        // Call the backend API to assign the truck.
        await assignTruck(truckData);
  
        // Add the moving truck marker.
        const markerEl = document.createElement("div");
        const markerRoot = createRoot(markerEl);
        markerRoot.render(<FaTruckFront size={25} />);
        markerRefs.current[colonyIndex] = new mapboxgl.Marker(markerEl)
          .setLngLat(trip.geometry.coordinates[0])
          .addTo(map.current);
  
        animateMarker(colonyIndex);
      }
    } catch (error) {
      console.error("Error fetching optimized route:", error);
    }
  };
  
  // Function to assign truck via backend API
  const assignTruck = async (truckData) => {
    try {
      const response = await fetch("http://localhost:4200/truck/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(truckData),
      });
      const result = await response.json();
      if (result.message === "Truck assigned successfully.") {
        console.log("Truck assignment successful:", result.data);
      } else {
        console.error("Truck assignment failed:", result);
      }
    } catch (error) {
      console.error("Error assigning truck:", error);
    }
  };

  // Helper: Calculate approximate Euclidean distance (for small distances).
  const getDistance = (pos1, pos2) => {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Check if truck marker is near any dustbin; if so, "empty" it.
  const checkAndEmptyDustbins = (colonyIndex, truckPos) => {
    // Get dustbins for the colony.
    const colonyDustbins = colonyIndex === 0 ? ctoWaypoints : vagaiWaypoints;
    const threshold = 0.0003; // Adjust threshold as needed.
    colonyDustbins.forEach((dustbin) => {
      if (dustbin.totalWaste > 0) {
        const distance = getDistance(truckPos, [dustbin.lng, dustbin.lat]);
        if (distance < threshold) {
          // "Empty" the dustbin by setting waste to 0.
          dustbin.totalWaste = 0;
          dustbin.description = "0%";
          // Update the corresponding marker to appear blue.
          if (dustbinMarkerRefs.current[dustbin.id]) {
            const markerContainer = dustbinMarkerRefs.current[dustbin.id].getElement();
            createRoot(markerContainer).render(
              <div>
                <BsTrash3Fill size={24} color="blue" />
                <div
                  style={{
                    color: "#363636",
                    fontSize: "12px",
                    fontWeight: "bold",
                    background: "white",
                    borderRadius: "4px",
                    padding: "2px",
                  }}
                >
                  0%
                </div>
              </div>
            );
          }
        }
      }
    });
  };

  const animateMarker = (colonyIndex) => {
    const speed = 0.003;
    progressRefs.current[colonyIndex] += speed;

    if (progressRefs.current[colonyIndex] >= routeRefs.current[colonyIndex].length - 1) {
      progressRefs.current[colonyIndex] = 0;
    }

    const index = Math.floor(progressRefs.current[colonyIndex]);
    const nextIndex = (index + 1) % routeRefs.current[colonyIndex].length;
    const startPoint = routeRefs.current[colonyIndex][index];
    const endPoint = routeRefs.current[colonyIndex][nextIndex];
    const segmentProgress = progressRefs.current[colonyIndex] - index;

    const lng = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
    const lat = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;

    // Update truck marker position.
    markerRefs.current[colonyIndex].setLngLat([lng, lat]);

    // Check if the truck is near any dustbin and update them.
    checkAndEmptyDustbins(colonyIndex, [lng, lat]);

    animationRefs.current[colonyIndex] = requestAnimationFrame(() =>
      animateMarker(colonyIndex)
    );
  };

  return (
    <div className="w-full h-screen relative">
      <div className="absolute z-10 top-4 left-4 text-3xl bg-white px-2 py-1 rounded-md font-semibold uppercase">
        Tambaram
      </div>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapboxMap;
