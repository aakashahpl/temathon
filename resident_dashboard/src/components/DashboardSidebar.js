import {
	FaHome,
	FaRecycle,
	FaBell,
	FaGift,
	FaExclamationTriangle,
} from "react-icons/fa";
import Link from "next/link";

export default function DashboardSidebar() {
	return (
		<div className="w-64 bg-white shadow-md p-4">
			<h2 className="text-xl font-bold text-green-600">Smart Waste</h2>
			<nav className="mt-4">
				<Link
					href="/dashboard"
					className="flex items-center space-x-2 py-2 text-gray-700 hover:text-green-600"
				>
					<FaHome /> <span>Dashboard</span>
				</Link>
				<Link
					href="#"
					className="flex items-center space-x-2 py-2 text-gray-700 hover:text-green-600"
				>
					<FaRecycle /> <span>Recycling Centers</span>
				</Link>
				<Link
					href="#"
					className="flex items-center space-x-2 py-2 text-gray-700 hover:text-green-600"
				>
					<FaBell /> <span>Notifications</span>
				</Link>
				<Link
					href="#"
					className="flex items-center space-x-2 py-2 text-gray-700 hover:text-green-600"
				>
					<FaGift /> <span>Rewards</span>
				</Link>
				<Link
					href="#"
					className="flex items-center space-x-2 py-2 text-gray-700 hover:text-green-600"
				>
					<FaExclamationTriangle /> <span>Report Issue</span>
				</Link>
			</nav>
		</div>
	);
}
