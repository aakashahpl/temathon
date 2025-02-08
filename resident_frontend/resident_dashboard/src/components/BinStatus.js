import { FaTrashAlt } from "react-icons/fa";

export default function BinStatus() {
	return (
		<div className="bg-white p-4 shadow-md rounded-lg">
			<h3 className="text-lg font-bold flex items-center">
				<FaTrashAlt className="text-green-600 mr-2" /> Bin Status
			</h3>
			<p className="text-gray-600">
				Your nearest bin is **70% full**. Empty soon! 🗑️
			</p>
		</div>
	);
}
