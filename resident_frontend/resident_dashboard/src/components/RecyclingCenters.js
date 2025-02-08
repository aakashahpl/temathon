import { FaMapMarkerAlt } from "react-icons/fa";

export default function RecyclingCenters() {
	return (
		<div className="bg-white p-4 shadow-md rounded-lg">
			<h3 className="text-lg font-bold flex items-center">
				<FaMapMarkerAlt className="text-green-600 mr-2" /> Nearby Recycling
				Centers
			</h3>
			<ul className="text-gray-600 mt-2">
				<li>♻️ Green Earth Center - 2km</li>
				<li>♻️ Eco Waste Facility - 5km</li>
			</ul>
		</div>
	);
}
