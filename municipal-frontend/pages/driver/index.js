"use client";
import React, { useState } from "react";
import MunicipalMap from "@/components/DriverMapBox";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

const pickupPoints = [
	{ id: 1, location: [80.11, 12.93], status: "pending", time: "10:00 AM" },
	{ id: 2, location: [80.12, 12.935], status: "completed", time: "10:30 AM" },
	{ id: 3, location: [80.115, 12.928], status: "missed", time: "11:00 AM" },
];

const Municipal = () => {
	const [points, setPoints] = useState(pickupPoints);
	const router = useRouter();

	const handleStatusChange = (id, newStatus) => {
		setPoints((prev) =>
			prev.map((point) =>
				point.id === id ? { ...point, status: newStatus } : point
			)
		);
	};

	const handleLogout = () => {
		router.push("/");
	};

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<div className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">
				<div>
					<h2 className="text-2xl font-bold mb-6">Driver Dashboard</h2>

					{/* Pickup Points List */}
					<h3 className="text-lg mb-4">Pickup Points</h3>
					<ul className="space-y-4">
						{points.map((point) => (
							<li key={point.id} className="p-3 bg-gray-800 rounded-lg">
								<p className="mb-1">Time: {point.time}</p>
								<p className="mb-2 capitalize">Status: {point.status}</p>
								{point.status === "pending" && (
									<div className="flex gap-2">
										<Button
											onClick={() => handleStatusChange(point.id, "completed")}
											className="flex-1 bg-green-600 hover:bg-green-700"
										>
											Complete
										</Button>
										<Button
											onClick={() => handleStatusChange(point.id, "missed")}
											className="flex-1 bg-red-600 hover:bg-red-700"
										>
											Missed
										</Button>
									</div>
								)}
							</li>
						))}
					</ul>
				</div>

				{/* Logout Button */}
				<Button
					onClick={handleLogout}
					className="w-full bg-red-600 hover:bg-red-700"
				>
					Logout
				</Button>
			</div>

			{/* Map */}
			<div className="flex-1">
				<MunicipalMap points={points} />
			</div>
		</div>
	);
};

export default Municipal;