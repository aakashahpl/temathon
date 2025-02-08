"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { BsTrash3Fill } from "react-icons/bs";
import { FaTruckMoving } from "react-icons/fa";
import { createRoot } from "react-dom/client";

// Replace with your real Mapbox token
mapboxgl.accessToken = "pk.eyJ1IjoiYWFrYXNocGF0ZWxhaHBsIiwiYSI6ImNsbWF2MnpkejBkeW8zcGpyNnZsZGs1ancifQ.1CZK6EwQfroKMlUqn1yobA";

export default function MunicipalMap({
  truck,
  dustbins,
  isPaused,
  onDustbinReached,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Route geometry from Mapbox Optimized Trips API
  const routeRef = useRef([]);
  // Progress along the route
  const progressRef = useRef(0);
  // Truck marker
  const truckMarkerRef = useRef(null);
  // Dustbin markers
  const dustbinMarkersRef = useRef([]);

  // Store old dustbin coordinates to detect changes
  const prevDustbinCoordsRef = useRef([]);

  // ----------------------------------------
  // 1) Initialize the Map only once
  // ----------------------------------------
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [80.100807, 12.928291], // Example center
        zoom: 16,
      });
    }
  }, []);

  // ----------------------------------------
  // 2) Handle changes to truck / dustbins
  // ----------------------------------------
  useEffect(() => {
    if (!map.current || !truck || dustbins.length === 0) return;

    // Convert dustbins to coordinate array
    const newCoords = dustbins.map((d) => [d.longitude, d.latitude]);

    // Check if dustbin coords changed
    const coordsChanged = haveCoordsChanged(prevDustbinCoordsRef.current, newCoords);
    prevDustbinCoordsRef.current = newCoords;

    // If coords haven't changed, only update dustbin marker colors
    if (!coordsChanged && truckMarkerRef.current) {
      updateDustbinMarkerColors();
      return;
    }

    // Otherwise, remove old route & markers and build new
    removeOldRouteAndMarkers();
    buildRouteAndMarkers(newCoords);
  }, [truck, dustbins]);

  // ----------------------------------------
  // 3) Remove old route + markers
  // ----------------------------------------
  const removeOldRouteAndMarkers = () => {
    // Remove dustbin markers
    dustbinMarkersRef.current.forEach((m) => m.remove());
    dustbinMarkersRef.current = [];

    // Remove truck marker
    if (truckMarkerRef.current) {
      truckMarkerRef.current.remove();
      truckMarkerRef.current = null;
    }

    // Remove old route
    if (map.current.getLayer("optimized-route")) {
      map.current.removeLayer("optimized-route");
    }
    if (map.current.getSource("optimized-route")) {
      map.current.removeSource("optimized-route");
    }
  };

  // ----------------------------------------
  // 4) Build the route & markers from scratch
  // ----------------------------------------
  const buildRouteAndMarkers = async (dustbinCoords) => {
    if (!truck.current_location) return;

    // If truck.current_location is [lng, lat], use as is
    // If it's GeoJSON, do: const startLocation = truck.current_location.coordinates;
    const startLocation = truck.current_location;

    // Combine truck location + dustbins
    const coordinates = [startLocation, ...dustbinCoords];

    // Fetch the optimized route (using Mapbox Optimized Trips API)
    const optimizedRoute = await fetchOptimizedRoute(coordinates);
    if (!optimizedRoute) return;

    routeRef.current = optimizedRoute.coordinates;
    progressRef.current = 0;

    // Add the route to the map
    addRouteToMap(optimizedRoute);

    // Create dustbin markers
    dustbins.forEach((dustbin) => {
      const marker = createDustbinMarker(dustbin);
      marker.addTo(map.current);
    });

    // Create the truck marker at start
    createTruckMarker(routeRef.current[0]);

    // Start animating
    animateMarker();
  };

  // ----------------------------------------
  // 5) Animate the truck marker
  // ----------------------------------------
  const animateMarker = () => {
    if (!routeRef.current || routeRef.current.length === 0) return;
    if (!truckMarkerRef.current) return;

    // If paused, don't move this frame
    if (isPaused) {
      requestAnimationFrame(animateMarker);
      return;
    }

    const speed = 0.005;
    progressRef.current += speed;

    if (progressRef.current >= routeRef.current.length - 1) {
      progressRef.current = routeRef.current.length - 1;
      // or loop back to 0 if you want: progressRef.current = 0;
    }

    const index = Math.floor(progressRef.current);
    const nextIndex = Math.min(index + 1, routeRef.current.length - 1);
    const startPoint = routeRef.current[index];
    const endPoint = routeRef.current[nextIndex];
    const segmentProgress = progressRef.current - index;

    const lng = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
    const lat = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;

    truckMarkerRef.current.setLngLat([lng, lat]);

    // Check if near any pending dustbin
    checkDustbinProximity([lng, lat]);

    requestAnimationFrame(animateMarker);
  };

  // ----------------------------------------
  // 6) Check if near a dustbin
  // ----------------------------------------
  const checkDustbinProximity = ([truckLng, truckLat]) => {
    const threshold = 0.0003;
    dustbins.forEach((dustbin) => {
      if (dustbin.status !== "pending") return;
      const dx = truckLng - dustbin.longitude;
      const dy = truckLat - dustbin.latitude;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < threshold) {
        onDustbinReached(dustbin.id);
      }
    });
  };

  // ----------------------------------------
  // 7) Update dustbin marker colors
  // ----------------------------------------
  const updateDustbinMarkerColors = () => {
    // Remove old
    dustbinMarkersRef.current.forEach((marker) => marker.remove());
    dustbinMarkersRef.current = [];

    // Re-add with new statuses
    dustbins.forEach((dustbin) => {
      const m = createDustbinMarker(dustbin);
      m.addTo(map.current);
    });
  };

  // ----------------------------------------
  // 8) Helpers
  // ----------------------------------------
  // Compare old vs. new dustbin coords
  const haveCoordsChanged = (prevCoords, newCoords) => {
    if (prevCoords.length !== newCoords.length) return true;
    for (let i = 0; i < newCoords.length; i++) {
      if (
        newCoords[i][0] !== prevCoords[i]?.[0] ||
        newCoords[i][1] !== prevCoords[i]?.[1]
      ) {
        return true;
      }
    }
    return false;
  };

  // **MAIN CHANGE**: Use Optimized Trips endpoint
  const fetchOptimizedRoute = async (coords) => {
    if (!coords || coords.length < 2) return null;

    // Convert coords to "lng,lat;lng,lat" format
    const waypoints = coords.map((c) => c.join(",")).join(";");

    // Additional parameters for optimized trips, e.g.:
    //   source=first -> fix start
    //   destination=last -> fix end
    //   roundtrip=false -> no return to start
    // The 'overview=full' param ensures we get full geometry
    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${waypoints}?geometries=geojson&overview=full&source=first&destination=last&roundtrip=false&access_token=${mapboxgl.accessToken}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error("Error fetching optimized trip:", res.statusText);
        return null;
      }
      const data = await res.json();

      // The optimized trips API returns `trips` array
      if (!data.trips || data.trips.length === 0) {
        console.error("No trips found");
        return null;
      }

      // Extract geometry from the first trip
      return data.trips[0].geometry; 
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const addRouteToMap = (geojson) => {
    if (map.current.getSource("optimized-route")) {
      map.current.getSource("optimized-route").setData(geojson);
    } else {
      map.current.addSource("optimized-route", {
        type: "geojson",
        data: geojson,
      });
      map.current.addLayer({
        id: "optimized-route",
        type: "line",
        source: "optimized-route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      });
    }
  };

  const createDustbinMarker = (dustbin) => {
    let markerColor = "#FF0000"; // pending => red
    if (dustbin.status === "completed") markerColor = "green";
    if (dustbin.status === "missed") markerColor = "red";

    const fillLevel = dustbin.bioFillLevel + dustbin.nonBioFillLevel;
    const el = document.createElement("div");
    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.alignItems = "center";

    const binIcon = createRoot(el);
    binIcon.render(
      <div>
        <BsTrash3Fill size={30} color={markerColor} />
        <div
          style={{
            color: "#363636",
            fontSize: "12px",
            fontWeight: "bold",
            background: "white",
            borderRadius: "4px",
            padding: "2px",
            marginTop: "2px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          {fillLevel}%
        </div>
      </div>
    );

    const dustbinMarker = new mapboxgl.Marker(el).setLngLat([
      dustbin.longitude,
      dustbin.latitude,
    ]);
    dustbinMarkersRef.current.push(dustbinMarker);
    return dustbinMarker;
  };

  const createTruckMarker = (startLngLat) => {
    const truckEl = document.createElement("div");
    const truckRoot = createRoot(truckEl);
    truckRoot.render(<FaTruckMoving size={35} color="black" />);

    truckMarkerRef.current = new mapboxgl.Marker(truckEl)
      .setLngLat(startLngLat)
      .addTo(map.current);
  };

  // ----------------------------------------
  // JSX: container for the map
  // ----------------------------------------
  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
