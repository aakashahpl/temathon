"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { BsTrash3Fill } from "react-icons/bs";
import { FaTruckFront } from "react-icons/fa6";
import { createRoot } from "react-dom/client";
import { FaLocationDot } from "react-icons/fa6";

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

	// Fetch dustbin data.
	useEffect(() => {
		fetch("http://localhost:4200/fetchAll")
			.then((response) => response.json())
			.then((data) => {
				if (data.message === "Dustbins fetched successfully.") {
					const ctoBins = data.data
						.filter((bin) => bin.location === "cto")
						.map((bin) => ({
							id: bin.id,
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
			.catch((error) => console.error("Error fetching dustbin data:", error));
	}, []);

	// Initialize the map once
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

		// Cleanup animations on unmount
		return () => {
			animationRefs.current.forEach((ref) => cancelAnimationFrame(ref));
		};
	}, [ctoWaypoints, vagaiWaypoints]);

	// Rerun route logic if currentTruck changes
	useEffect(() => {
		handleTruckSelection();
	}, [currentTruck]);

	// Add static markers for colonies with labels.
	const addCustomMarkers = () => {
		const colonyMarkers = [
			{
				coords: [80.09783, 12.930755],
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

			// Base marker
			new mapboxgl.Marker()
				.setLngLat(coords)
				.setPopup(
					new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${label}</h3>`)
				)
				.addTo(map.current);

			// Labeled marker
			new mapboxgl.Marker(el).setLngLat(coords).addTo(map.current);
		});
	};

	const handleTruckSelection = () => {
		// Clear truck markers and routes but not dustbins
		clearPreviousTruckData();

		const colonies = [
			{ name: "CTO Colony", waypoints: ctoWaypoints },
			{ name: "Vagai Colony", waypoints: vagaiWaypoints },
		];

		colonies.forEach((colony, colonyIndex) => {
			// only proceed if currentTruck=0 (all) or matches colonyIndex+1
			if (currentTruck === 0 || currentTruck === colonyIndex + 1) {
				// Render/update dustbin markers
				colony.waypoints.forEach((marker) => {
					// Red if totalWaste > 50, else green
					const markerColor = marker.totalWaste > 50 ? "red" : "green";

					// If marker exists, update; otherwise create new
					if (dustbinMarkerRefs.current[marker.id]) {
						const markerEl = dustbinMarkerRefs.current[marker.id].getElement();
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
						// Create a new dustbin marker
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

				// For route calculation, use only dustbins with totalWaste > 50
				const waypointsForRoute = colony.waypoints.filter(
					(marker) => marker.totalWaste > 50
				);
				if (waypointsForRoute.length > 0) {
					fetchOptimizedRoute(waypointsForRoute, "black", colonyIndex);
				}
			}
		});
	};

	// Clear truck markers and route layers, keep dustbins
	const clearPreviousTruckData = () => {
		// Cancel any running animations
		animationRefs.current.forEach((ref) => cancelAnimationFrame(ref));
		animationRefs.current = [];

		// Remove route layers and sources
		[0, 1].forEach((colonyIndex) => {
			const routeId = `route-${colonyIndex}`;
			if (map.current.getLayer(routeId)) {
				map.current.removeLayer(routeId);
			}
			if (map.current.getSource(routeId)) {
				map.current.removeSource(routeId);
			}
		});

		// Remove truck markers
		markerRefs.current.forEach((marker) => {
			if (marker) marker.remove();
		});
		markerRefs.current = [];
		progressRefs.current = [0, 0];
	};

	// Use the Optimization API to get the route, then animate truck marker
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
						"line-color": color,
						"line-width": 4,
					},
				});

				// Create & add the truck marker
				const markerEl = document.createElement("div");
				const markerRoot = createRoot(markerEl);
				markerRoot.render(<FaTruckFront size={25} />);
				markerRefs.current[colonyIndex] = new mapboxgl.Marker(markerEl)
					.setLngLat(routeRefs.current[colonyIndex][0])
					.addTo(map.current);

				animateMarker(colonyIndex);
			}
		} catch (error) {
			console.error("Error fetching optimized route:", error);
		}
	};

	// Animate the truck marker along the route
	const animateMarker = (colonyIndex) => {
		const speed = 0.003;
		progressRefs.current[colonyIndex] += speed;

		if (
			progressRefs.current[colonyIndex] >=
			routeRefs.current[colonyIndex].length - 1
		) {
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

		// No dustbin-emptying logic is needed

		animationRefs.current[colonyIndex] = requestAnimationFrame(() =>
			animateMarker(colonyIndex)
		);
	};

	return (
		<div className="w-full h-screen relative">
			<div className="absolute z-10 top-4 left-4 text-3xl bg-white px-2 py-1 rounded-md font-semibold flex gap-2 items-center justify-center">
				<FaLocationDot size={25} />
				Tambaram
			</div>
			<div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
		</div>
	);
};

export default MapboxMap;
