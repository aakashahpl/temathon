"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FaMapMarkerAlt } from "react-icons/fa";
import { createRoot } from "react-dom/client";

mapboxgl.accessToken =
	"pk.eyJ1IjoiYWFrYXNocGF0ZWxhaHBsIiwiYSI6ImNsbWF2MnpkejBkeW8zcGpyNnZsZGs1ancifQ.1CZK6EwQfroKMlUqn1yobA";

const DriverMapBox = ({ points }) => {
	const mapContainer = useRef(null);
	const map = useRef(null);
	const markersRef = useRef([]);

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
			updateMarkers();
		});

		return () => {
			if (map.current) {
				map.current.remove();
			}
		};
	}, []);

	useEffect(() => {
		if (map.current) {
			updateMarkers();
		}
	}, [points]);

	const updateMarkers = () => {
		// Clear existing markers
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		points.forEach((point) => {
			const el = document.createElement("div");
			const root = createRoot(el);

			root.render(
				<div className="cursor-pointer">
					<FaMapMarkerAlt
						size={24}
						color={
							point.status === "completed"
								? "#22c55e" // green
								: point.status === "missed"
								? "#ef4444" // red
								: "#3b82f6" // blue
						}
					/>
				</div>
			);

			const marker = new mapboxgl.Marker(el)
				.setLngLat(point.location)
				.setPopup(
					new mapboxgl.Popup({ offset: 25 }).setHTML(
						`<div class="p-2">
                <h3 class="font-bold capitalize">${point.status}</h3>
                <p class="text-sm">${point.time}</p>
              </div>`
					)
				)
				.addTo(map.current);

			markersRef.current.push(marker);
		});
	};

	return (
		<div className="w-full h-full">
			<div ref={mapContainer} className="w-full h-full" />
		</div>
	);
};

export default DriverMapBox;
