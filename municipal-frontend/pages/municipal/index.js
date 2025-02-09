import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import MapboxMap from "@/components/MapboxMap";
import { Button } from "@/components/ui/button";
import { Menu, X, Truck, MapPin, Bell, LogOut } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Sidebar = () => {
	const [pendingRequests, setPendingRequests] = useState([]);
	const [currentTruck, setCurrentTruck] = useState(0);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const mapRef = useRef(null);
	const router = useRouter();
	const API_URL = "http://localhost:4200";

	const handleTruckChange = (option, value) => {
		setCurrentTruck(value);
	};

	const fetchPendingRequests = async () => {
		try {
			const response = await fetch(`${API_URL}/pending-requests`);
			if (response.ok) {
				const data = await response.json();
				setPendingRequests(data);
			}
		} catch (error) {
			console.error("Error fetching pending requests:", error);
		}
	};

	useEffect(() => {
		fetchPendingRequests();
	}, []);

	const approveRequest = async (dustbinId, e) => {
		e.stopPropagation();
		try {
			const response = await fetch(`${API_URL}/approve-pickup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ dustbinId }),
			});

			if (response.ok) {
				fetchPendingRequests();
			}
		} catch (error) {
			console.error("Error approving request:", error);
		}
	};

	const handleMoveToTransferStation = () => {
		if (mapRef.current) {
			mapRef.current.flyTo({
				center: [80.100612, 12.93601],
				zoom: 16,
				essential: true,
			});
		}
	};

	const handleLogout = () => {
		router.push("/");
	};

	return (
		<div className="flex h-screen">
			{/* Mobile Sidebar Toggle */}
			<button
				className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-md"
				onClick={() => setIsSidebarOpen(!isSidebarOpen)}
			>
				{isSidebarOpen ? (
					<X className="h-6 w-6 text-white" />
				) : (
					<Menu className="h-6 w-6 text-white" />
				)}
			</button>

			{/* Sidebar */}
			<div
				className={`${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} lg:translate-x-0 fixed lg:static w-64 bg-gray-900 h-full transition-transform duration-300 ease-in-out z-40`}
			>
				<div className="flex flex-col h-full p-6">
					<div className="space-y-6">
						{/* Header */}
						<div className="flex items-center space-x-2">
							<MapPin className="h-6 w-6 text-blue-500" />
							<h2 className="text-xl font-bold text-white">
								Municipal Dashboard
							</h2>
						</div>

						{/* Truck Selection */}
						<div className="space-y-2">
							<label className="text-sm text-gray-400">Select Truck</label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700">
										<Truck className="mr-2 h-4 w-4" />
										{currentTruck === 0
											? "All Trucks"
											: `Truck ${currentTruck}`}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56 bg-gray-800 text-white border border-gray-700">
									<DropdownMenuItem
										onClick={() => handleTruckChange("All", 0)}
										className="hover:bg-gray-700"
									>
										All Trucks
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleTruckChange("Truck 1", 1)}
										className="hover:bg-gray-700"
									>
										Truck 1
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleTruckChange("Truck 2", 2)}
										className="hover:bg-gray-700"
									>
										Truck 2
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Transfer Station Button */}
						<Button
							onClick={handleMoveToTransferStation}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white"
						>
							<MapPin className="mr-2 h-4 w-4" />
							Transfer Station
						</Button>

						{/* Pending Requests */}
						<div className="space-y-2">
							<label className="text-sm text-gray-400">Pending Requests</label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700">
										<Bell className="mr-2 h-4 w-4" />
										{pendingRequests.length} Requests
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56 bg-gray-800 text-white border border-gray-700 max-h-64 overflow-y-auto">
									{pendingRequests.length === 0 ? (
										<DropdownMenuItem className="text-gray-400">
											No pending requests
										</DropdownMenuItem>
									) : (
										pendingRequests.map((req) => (
											<DropdownMenuItem
												key={req.id}
												className="flex items-center justify-between hover:bg-gray-700"
											>
												<span>Request {req.id}</span>
												<Button
													onClick={(e) => approveRequest(req.id, e)}
													className="bg-green-600 hover:bg-green-700 h-7 text-xs"
												>
													Approve
												</Button>
											</DropdownMenuItem>
										))
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Logout Button */}
					<Button
						onClick={handleLogout}
						className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white"
					>
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1">
				<MapboxMap currentTruck={currentTruck} ref={mapRef} />
			</div>
		</div>
	);
};

export default Sidebar;
