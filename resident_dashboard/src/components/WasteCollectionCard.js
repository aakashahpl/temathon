import { FaCalendarAlt } from "react-icons/fa";

export default function WasteCollectionCard() {
	return (
		<div className="bg-white p-4 shadow-md rounded-lg flex items-center space-x-4">
			<FaCalendarAlt className="text-green-600 text-2xl" />
			<div>
				<h3 className="text-lg font-bold">Next Collection</h3>
				<p className="text-gray-600">Friday, 10 AM</p>
			</div>
		</div>
	);
}
