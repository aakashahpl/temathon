"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { BsTrash3Fill } from "react-icons/bs";
import { FaTruckFront } from "react-icons/fa6";
import { createRoot } from 'react-dom/client';


const MapboxMap = ({ currentTruck }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationRefs = useRef([]);
  const progressRefs = useRef([0, 0]);
  const routeRefs = useRef([null, null]);
  const markerRefs = useRef([null, null]);

  const [ctoWaypoints, setCtoWaypoints] = useState([]);
  const [vagaiWaypoints, setVagaiWaypoints] = useState([]);

  useEffect(() => {
    // Fetch dustbin data from API and filter by location
    fetch("http://localhost:4200/dustbin/fetchAll")
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Dustbins fetched successfully.") {
          // Filter data based on locations (cto and vagai)
          const ctoBins = data.data.filter((bin) => bin.location === "cto").map((bin) => ({
            lng: bin.longitude,
            lat: bin.latitude,
            description: `${bin.totalWaste}%`,
            totalWaste: bin.totalWaste,  // Store for color logic
          }));

          const vagaiBins = data.data.filter((bin) => bin.location === "vagai").map((bin) => ({
            lng: bin.longitude,
            lat: bin.latitude,
            description: `${bin.totalWaste}%`,
            totalWaste: bin.totalWaste,  // Store for color logic
          }));

          setCtoWaypoints(ctoBins);
          setVagaiWaypoints(vagaiBins);
        }
      })
      .catch((error) => console.error("Error fetching dustbin data:", error));
  }, []);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [80.100807, 12.928291],
        zoom: 16,
      });
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

  const handleTruckSelection = () => {
    clearPreviousMapData();

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
        // Display all markers but filter waypoints for the route
        const waypointsForRoute = colony.waypoints.filter((marker) => marker.totalWaste > 50);

        colony.waypoints.forEach((marker) => {
          // Set marker color based on totalWaste level
          const markerColor = marker.totalWaste > 50 ? "red" : "green";

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

          new mapboxgl.Marker(el)
            .setLngLat([marker.lng, marker.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<h3>${marker.description}</h3>`
              )
            )
            .addTo(map.current);
        });

        if (waypointsForRoute.length > 0) {
          fetchRoute(waypointsForRoute, "black", colonyIndex);  // Set route color to black
        }
      }
    });
  };

  const clearPreviousMapData = () => {
    animationRefs.current.forEach((ref) => cancelAnimationFrame(ref));
    animationRefs.current = [];

    // Remove all sources and layers from the map
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

  const fetchRoute = async (waypoints, color, colonyIndex) => {
    const coordinates = waypoints.map((marker) => `${marker.lng},${marker.lat}`).join(";");
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        routeRefs.current[colonyIndex] = data.routes[0].geometry.coordinates;

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
            "line-color": color,  // Always set to black
            "line-width": 4,
          },
        });

        const markerEl = document.createElement("div");
        const markerRoot = createRoot(markerEl);
        markerRoot.render(<FaTruckFront size={25} />);

        markerRefs.current[colonyIndex] = new mapboxgl.Marker(markerEl)
          .setLngLat(routeRefs.current[colonyIndex][0])
          .addTo(map.current);

        animateMarker(colonyIndex);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const animateMarker = (colonyIndex) => {
    const speed = 0.005;
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

    markerRefs.current[colonyIndex].setLngLat([lng, lat]);
    animationRefs.current[colonyIndex] = requestAnimationFrame(() => animateMarker(colonyIndex));
  };

  return (
    <div className="w-12/12 h-screen">
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapboxMap;
