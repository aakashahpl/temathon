"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { BsTrash3Fill, BsFillTruckFrontFill } from "react-icons/bs";
import { FaTruckFront } from "react-icons/fa6";
import { createRoot } from 'react-dom/client';


const MapboxMap = ({ currentTruck }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationRefs = useRef([]);
  const progressRefs = useRef([0, 0]);
  const routeRefs = useRef([null, null]);
  const markerRefs = useRef([null, null]);


  const colonies = [
    {
      name: "CTO Colony",
      color: "#f18069",
      waypoints: [
        { lng: 80.098928, lat: 12.931811, description: "cto bin 1" },
        { lng: 80.098654, lat: 12.930553, description: "cto bin 2" },
        { lng: 80.099129, lat: 12.930379, description: "cto bin 3" },
        { lng: 80.099418, lat: 12.929582, description: "cto bin 4" },
        { lng: 80.098823, lat: 12.929678, description: "cto bin 5" },
        { lng: 80.098179, lat: 12.929802, description: "cto bin 6" },
        { lng: 80.097624, lat: 12.929872, description: "cto bin 7" },
        { lng: 80.099471, lat: 12.929073, description: "cto bin 8" },
        { lng: 80.098785, lat: 12.929195, description: "cto bin 9" },
        { lng: 80.098458, lat: 12.929244, description: "cto bin 10" },
        { lng: 80.096610, lat: 12.929508, description: "cto bin 11" },
        { lng: 80.096931, lat: 12.927988, description: "cto bin 12" },
        { lng: 80.101092, lat: 12.935907, description: "cto bin 13" },
      ],
    },
    {
      name: "Vagai Colony",
      color: "#3ba8f7",
      waypoints: [
        { lng: 80.100807, lat: 12.928291, description: "vagai bin 1" },
        { lng: 80.101276, lat: 12.927797, description: "vagai bin 2" },
        { lng: 80.101200, lat: 12.927148, description: "vagai bin 3" },
        { lng: 80.101125, lat: 12.926514, description: "vagai bin 4" },
        { lng: 80.101064, lat: 12.925946, description: "vagai bin 5" },
        { lng: 80.101092, lat: 12.935907, description: "transfer station" },

        // { lng: 80.096931, lat: 12.927988, description: "cto bin 16" }
      ],
    }
  ];

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
      // Clean up ongoing animations when component unmounts
      animationRefs.current.forEach((ref) => cancelAnimationFrame(ref));
    };
  }, []);

  useEffect(() => {
    handleTruckSelection();
  }, [currentTruck]);

  const handleTruckSelection = () => {
    // Clear existing markers, routes, and animations
    clearPreviousMapData();

    colonies.forEach((colony, colonyIndex) => {
      if (currentTruck === 0 || currentTruck === colonyIndex + 1) {
        colony.waypoints.forEach((marker) => {
          const el = document.createElement('div');
          const binIcon = createRoot(el);
          binIcon.render(
            <div>
              <BsTrash3Fill size={24} color="#f18069" />
              <div style={{
                color: "#363636",
                fontSize: "12px",
                fontWeight: "bold",
                background: "white",
                borderRadius: "4px",
                padding: "2px"
              }}>
                100%
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

        fetchRoute(colony.waypoints, "#363636", colonyIndex);
      }
    });
  };

  const clearPreviousMapData = () => {
    // Stop all animations
    animationRefs.current.forEach((ref) => cancelAnimationFrame(ref));
    animationRefs.current = [];

    // Remove all sources and layers from the map
    colonies.forEach((_, colonyIndex) => {
      const routeId = `route-${colonyIndex}`;
      if (map.current.getLayer(routeId)) {
        map.current.removeLayer(routeId);
      }
      if (map.current.getSource(routeId)) {
        map.current.removeSource(routeId);
      }
    });

    // Clear markers and progress references
    markerRefs.current.forEach((marker) => {
      if (marker) marker.remove();
    });
    markerRefs.current = [];
    progressRefs.current = [0, 0];
  };

  const fetchRoute = async (waypoints, color, colonyIndex) => {
    const coordinates = waypoints.map(marker => `${marker.lng},${marker.lat}`).join(';');
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
            "line-color": color,
            "line-width": 4,
          },
        });

        // Initialize the truck marker
        const markerEl = document.createElement('div');
        const markerRoot = createRoot(markerEl);
        markerRoot.render(
          <FaTruckFront size={25} />
        );

        markerRefs.current[colonyIndex] = new mapboxgl.Marker(markerEl)
          .setLngLat(routeRefs.current[colonyIndex][0])
          .addTo(map.current);

        animateMarker(colonyIndex);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
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
    <div className="w-100 h-screen">
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapboxMap;
