"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { BsTrash3Fill } from "react-icons/bs";
import { createRoot } from 'react-dom/client';


const MapboxMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const animationRef = useRef(null);
  const route = useRef(null);
  const progress = useRef(0);

  // Define waypoints for the route
  const waypoints = [
    { lng: 80.098928, lat: 12.931811, description: "circle1 bin" },
    { lng: 80.098654, lat: 12.930553, description: "circle2 bin" },
    { lng: 80.099129, lat: 12.930379, description: "corner bin" },
    { lng: 80.099418, lat: 12.929582, description: "house 1" },
    { lng: 80.098823, lat: 12.929678, description: "house 3" },
    { lng: 80.098179, lat: 12.929802, description: "house 4" },
    { lng: 80.097624, lat: 12.929872, description: "house 5" },
    { lng: 80.099471, lat: 12.929073, description: "house 6" },
    { lng: 80.098785, lat: 12.929195, description: "house 7" },
    { lng: 80.098458, lat: 12.929244, description: "house 8" },
    { lng: 80.096610, lat: 12.929508, description: "house 9" },
    { lng: 80.099317, lat: 12.928590, description: "house 10" },
    { lng: 80.098586, lat: 12.928724, description: "house 11" },
    { lng: 80.097966, lat: 12.928811, description: "house 12" },
    { lng: 80.101092, lat: 12.935907, description: "house 13" },
    { lng:80.096931, lat: 12.927988, description: "house 13" }


  ];

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [80.098928, 12.931811],
      zoom: 16,
      projection: "mercator",
    });

    map.current.on("load", () => {
      // Add custom markers to the map
      waypoints.forEach((marker) => {
        const el = document.createElement('div');
        const binIcon = createRoot(el);
        binIcon.render(
          <div>
            <BsTrash3Fill size={24} color="#f18069" />
            <div style={{ color: "#f18069", fontSize: "12px", fontWeight: "bold", background: "white", borderRadius: "4px", padding: "2px" }}>100%</div>
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

      // Fetch and display the route connecting the waypoints
      fetchRoute(waypoints);
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waypoints]);

  const fetchRoute = async (waypoints) => {
    const coordinates = waypoints.map(marker => `${marker.lng},${marker.lat}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        route.current = data.routes[0].geometry.coordinates;

        // Add the route as a line on the map
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route.current,
            },
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#888",
            "line-width": 4,
          },
        });

        // Initialize the moving marker at the starting point
        const movingEl = document.createElement('div');
        movingEl.className = 'moving-marker';
        movingEl.style.backgroundColor = '#f18069';
        movingEl.style.width = '24px';
        movingEl.style.height = '24px';
        movingEl.style.borderRadius = '50%';

        markerRef.current = new mapboxgl.Marker(movingEl)
          .setLngLat(route.current[0])
          .addTo(map.current);

        // Start the animation
        animateMarker();
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const animateMarker = () => {
    const speed = 0.005; // Adjust this value to change the speed of the animation
    progress.current += speed;

    if (progress.current >= route.current.length - 1) {
      progress.current = 0; // Reset to start
    }

    const index = Math.floor(progress.current);
    const nextIndex = (index + 1) % route.current.length;
    const startPoint = route.current[index];
    const endPoint = route.current[nextIndex];
    const segmentProgress = progress.current - index;

    const lng = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
    const lat = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;

    markerRef.current.setLngLat([lng, lat]);

    animationRef.current = requestAnimationFrame(animateMarker);
  };

  return (
    <div className="w-100 h-screen">
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default MapboxMap;
