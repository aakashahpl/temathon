"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { BsTrash3Fill } from "react-icons/bs";
import { createRoot } from "react-dom/client";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWFrYXNocGF0ZWxhaHBsIiwiYSI6ImNsbWF2MnpkejBkeW8zcGpyNnZsZGs1ancifQ.1CZK6EwQfroKMlUqn1yobA";

const DriverMapBox = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [truck, setTruck] = useState(null);
  const dustbinMarkersRef = useRef([]);

  // Initialize the map.
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [80.100807, 12.928291],
        zoom: 16,
      });
    }
  }, []);

  // Fetch truck data.
  useEffect(() => {
    fetch("http://localhost:4200/truck/getTruck/15")
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Truck fetched successfully." && data.data) {
          console.log("Truck data:", data.data);
          setTruck(data.data);
        }
      })
      .catch((error) => console.error("Error fetching truck data:", error));
  }, []);

  // Display route and markers once truck data is fetched.
  useEffect(() => {
    if (map.current && truck && truck.route_geometry) {
      // --- Route Layer ---
      if (map.current.getSource("truck-route")) {
        map.current.getSource("truck-route").setData(truck.route_geometry);
      } else {
        map.current.addSource("truck-route", {
          type: "geojson",
          data: truck.route_geometry,
        });
        map.current.addLayer({
          id: "truck-route",
          type: "line",
          source: "truck-route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#000", // black route
            "line-width": 4,
          },
        });
      }

      // --- Truck Marker ---
      new mapboxgl.Marker({ color: "#3b82f6" }) // blue marker
        .setLngLat(truck.current_location)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold">${truck.truck_number}</h3>
              <p>Status: ${truck.status}</p>
            </div>`
          )
        )
        .addTo(map.current);

      // --- Dustbin Markers ---
      dustbinMarkersRef.current.forEach((marker) => marker.remove());
      dustbinMarkersRef.current = [];

      // Use route geometry coordinates for dustbin marker locations.
      const { coordinates } = truck.route_geometry;
      coordinates.forEach((coord, index) => {
        const dustbinId =
          truck.dustbin_ids && truck.dustbin_ids[index] !== undefined
            ? truck.dustbin_ids[index]
            : index + 1;

        // Create a marker container.
        const el = document.createElement("div");
        el.className = "dustbin-marker";
        el.style.width = "30px";
        el.style.height = "30px";

        // Render the dustbin icon.
        const root = createRoot(el);
        root.render(<BsTrash3Fill size={24} color="gray" />);

        // Create marker and add popup (optional).
        const dustbinMarker = new mapboxgl.Marker(el)
          .setLngLat(coord)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2"><h3>Dustbin ${dustbinId}</h3></div>`
            )
          )
          .addTo(map.current);

        dustbinMarkersRef.current.push(dustbinMarker);
      });
    }
  }, [truck]);

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default DriverMapBox;
