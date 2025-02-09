import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	AreaChart,
	Area,
} from "recharts";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";

import { CheckCircle } from "lucide-react";

import {
	Bell,
	Calendar,
	Settings,
	User,
	Trash2,
	Recycle,
	TrendingUp,
	MapPin,
	Clock,
	AlertTriangle,
	Menu,
	Moon,
	Sun,
	LogOut,
	Phone,
} from "lucide-react";
import { fetchDustbinData } from "./api/dustbin";

export default function Dashboard() {
	const router = useRouter();
	const [darkMode, setDarkMode] = useState(false);
	const [isSidebarOpen, setSidebarOpen] = useState(true);
	const [pickupScheduled, setPickupScheduled] = useState(false);
	const [pickupTime, setPickupTime] = useState(null);
	const [notification, setNotification] = useState(null);
	const currDate = new Date();
	const [binStatus, setBinStatus] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const [locations, setLocations] = useState([]);
	const [locationError, setLocationError] = useState(null);
	const [activeSection, setActiveSection] = useState("Dashboard");

	const API_URL = "http://localhost:4200";
	useEffect(() => {
		const storedTheme = localStorage.getItem("theme");
		if (storedTheme === "dark") {
			document.documentElement.classList.add("dark");
			setDarkMode(true);
		}
	}, []);
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
			setSidebarOpen(window.innerWidth >= 768);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		const fetchNearbyCenters = async (location) => {
			try {
				const response = await fetch(`${API_URL}/center/${location}`);
				if (!response.ok) {
					throw new Error("Failed to fetch locations");
				}
				const data = await response.json();
				setLocations(data.data); // Assuming the response contains a "data" field with centers info
			} catch (error) {
				setLocationError(error.message);
			}
		};

		// You can either hardcode a location, use the browser's geolocation, or let the user input the location.
		const fetchLocation = () => {
			// For demonstration, we will use a static location.
			const userLocation = "cto"; // Replace with dynamic location logic
			fetchNearbyCenters(userLocation);
		};

		fetchLocation();
	}, []);

	useEffect(() => {
		const getData = async () => {
			const data = await fetchDustbinData();

			setBinStatus(data.totalWaste);
			setLoading(false);

			setPickupTime(new Date(data.scheduledPickupDate));
			setPickupScheduled(data.scheduledPickupDate !== null); // If a pickup is scheduled
		};
		getData();
	}, []);

	const sidebarClass = `
    fixed md:static
    ${isSidebarOpen ? "w-64" : "w-0 md:w-20"} 
    h-full
    bg-white dark:bg-gray-800
    transition-all duration-300
    border-r border-gray-200 dark:border-gray-700
    z-50
    overflow-hidden
  `;

	const mainContentClass = `
    flex-1
    w-full
    overflow-auto
    transition-all
    duration-300
    ${isSidebarOpen && isMobile ? "opacity-50" : "opacity-100"}
  `;

	if (loading) return <p>Loading dustbin data...</p>;

	if (!binStatus) return <p>No dustbin data found.</p>;

	const handleSchedulePickup = async () => {
		const currDate = new Date();
		const nextDay = new Date(currDate);
		nextDay.setDate(currDate.getDate() + 1);
		nextDay.setHours(10, 0, 0, 0);

		// Make the API call to request the pickup
		const response = await fetch(`${API_URL}/pickup`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ action: "schedule" }),
		});

		if (response.ok) {
			// If the response is successful, update the state
			const data = await response.json();

			// Check if pickupStatus is 2 (scheduled)
			if (data.pickupStatus !== 2) {
				setPickupScheduled(false);
				setNotification({
					type: "info",
					message: "Request initiated. Waiting for pickup to be scheduled.",
				});

				const checkStatusInterval = setInterval(async () => {
					const dustbinData = await fetchDustbinData();

					if (dustbinData.pickupStatus === 2) {
						clearInterval(checkStatusInterval);
						setPickupScheduled(true);
						setPickupTime(nextDay);
						setNotification({
							type: "success",
							message: `Pickup scheduled for ${nextDay.toDateString()} at 10:00 AM`,
						});
					} else {
						setNotification({
							type: "info",
							message: "Request initiated. Waiting for pickup to be scheduled.",
						});
					}
				}, 5000);
			} else {
				setPickupScheduled(true);
				setPickupTime(nextDay);
				setNotification({
					type: "success",
					message: `Pickup scheduled for ${nextDay.toDateString()} at 10:00 AM`,
				});
			}
		} else {
			const data = await response.json();
			setNotification({
				type: "error",
				message: data.error || "Failed to schedule pickup",
			});
		}
	};

	const handleCancelPickup = async () => {
		if (!pickupScheduled) {
			setNotification({
				type: "warning",
				message: "No Pick-ups Scheduled",
			});
		} else {
			const response = await fetch(`${API_URL}/pickup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ action: "cancel" }),
			});

			if (response.ok) {
				const nextPickup = new Date(currDate);
				nextPickup.setDate(nextPickup.getDate() + 2);
				nextPickup.setHours(10, 0, 0, 0);

				setPickupTime(nextPickup);

				setPickupScheduled(false);
				setNotification({
					type: "warning",
					message: `Pickup canceled. Next scheduled pickup: ${nextPickup.toDateString()} at 10:00 AM`,
				});
			} else {
				const data = await response.json();
				setNotification({
					type: "error",
					message: data.error || "Failed to cancel pickup",
				});
			}
		}
	};

	const toggleDarkMode = () => {
		const newMode = !darkMode;
		setDarkMode(newMode);
		if (newMode) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	};

	const handleLogout = async () => {
		await signOut(auth);
		router.push("/");
	};

	// Sample data for charts
	const sampleData = [
		{ month: "Jan", biodegradable: 30, nonBiodegradable: 20 },
		{ month: "Feb", biodegradable: 50, nonBiodegradable: 35 },
		{ month: "Mar", biodegradable: 40, nonBiodegradable: 25 },
		{ month: "Apr", biodegradable: 60, nonBiodegradable: 45 },
		{ month: "May", biodegradable: 55, nonBiodegradable: 30 },
		{ month: "June", biodegradable: 78, nonBiodegradable: 34 },
		{ month: "July", biodegradable: 36, nonBiodegradable: 45 },
		{ month: "August", biodegradable: 12, nonBiodegradable: 28 },
		{ month: "September", biodegradable: 23, nonBiodegradable: 12 },
	];

	const notifications = [
		{
			id: 1,
			title: "Bin status",
			description: `Bin : ${binStatus} % full`,
			type: "warning",
		},
		{
			id: 2,
			title: "Pickup scheduled",
			description: pickupTime
				? getPickupDescription(pickupTime)
				: "No pickup scheduled",
			type: "info",
		},
	];

	function getPickupDescription(pickupTime) {
		if (!pickupTime) return "No pickup scheduled";

		const currentDate = new Date();
		const pickupDate = new Date(pickupTime);

		// Reset time components to compare just the dates
		const currentDay = new Date(currentDate.setHours(0, 0, 0, 0));
		const pickupDay = new Date(pickupDate.setHours(0, 0, 0, 0));

		// Calculate difference in days
		const diffTime = pickupDay.getTime() - currentDay.getTime();
		const daysUntilPickup = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (daysUntilPickup === 1) {
			return "Pickup is tomorrow";
		} else if (daysUntilPickup === 0) {
			return "Pickup is today";
		} else if (daysUntilPickup > 1) {
			return `Next pickup in ${daysUntilPickup} days`;
		} else {
			return "Pickup is overdue";
		}
	}
	const parseTime = (timeStr) => {
		if (!timeStr) return null;

		// Remove any extra spaces and convert to lowercase
		timeStr = timeStr.trim().toLowerCase();

		// Extract hours and minutes
		const [time, period] = timeStr.split(/(?=[ap]m)/);
		const [hours, minutes] = time.split(":");

		let hour = parseInt(hours);
		const minute = parseInt(minutes);

		// Convert to 24-hour format
		if (period === "pm" && hour !== 12) {
			hour += 12;
		} else if (period === "am" && hour === 12) {
			hour = 0;
		}

		return { hours: hour, minutes: minute };
	};

	const formatTime = (timeStr) => {
		if (!timeStr) return "Not specified";
		// Just return the original time string as it's already in the desired format
		return timeStr.trim();
	};

	const isOpen = (openTime, closeTime) => {
		if (!openTime || !closeTime) return null;

		const now = new Date();
		const currentHours = now.getHours();
		const currentMinutes = now.getMinutes();
		const currentTimeInMinutes = currentHours * 60 + currentMinutes;

		const openTimeParsed = parseTime(openTime);
		const closeTimeParsed = parseTime(closeTime);

		if (!openTimeParsed || !closeTimeParsed) return null;

		const openTimeInMinutes =
			openTimeParsed.hours * 60 + openTimeParsed.minutes;
		const closeTimeInMinutes =
			closeTimeParsed.hours * 60 + closeTimeParsed.minutes;

		return (
			currentTimeInMinutes >= openTimeInMinutes &&
			currentTimeInMinutes <= closeTimeInMinutes
		);
	};

	const renderLocationError = locationError ? (
		<Alert className="mb-4">
			<AlertTriangle className="h-4 w-4" />
			<AlertDescription>{locationError}</AlertDescription>
		</Alert>
	) : null;

	const renderLocations =
		locations.length > 0 ? (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{locations.map((center) => {
					const openStatus = isOpen(center.open_time, center.close_time);
					return (
						<Card
							key={center.id}
							className="hover:shadow-lg transition-shadow duration-200"
						>
							<CardHeader className="pb-2">
								<div className="flex justify-between items-start">
									<div>
										<CardTitle className="text-xl font-bold">
											{center.name}
										</CardTitle>
										{openStatus !== null && (
											<span
												className={`text-sm font-medium ${
													openStatus ? "text-green-600" : "text-red-600"
												}`}
											>
												{openStatus ? "● Open Now" : "● Closed"}
											</span>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-start space-x-2">
										<MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
										<CardDescription className="text-sm">
											{center.address}
										</CardDescription>
									</div>

									<div className="flex items-center space-x-2">
										<Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
										<CardDescription className="text-sm">
											{formatTime(center.open_time)} -{" "}
											{formatTime(center.close_time)}
										</CardDescription>
									</div>

									{center.phone && (
										<div className="flex items-center space-x-2">
											<Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
											<CardDescription className="text-sm">
												<a
													href={`tel:${center.phone}`}
													className="hover:text-blue-600 transition-colors"
												>
													{center.phone}
												</a>
											</CardDescription>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		) : (
			<div className="text-center py-8">
				<p className="text-gray-600 dark:text-gray-400">
					No nearby recycling centers found.
				</p>
			</div>
		);
	return (
		<div className="flex h-screen bg-gray-100 dark:bg-gray-900">
			{/* Sidebar */}
			{isMobile && isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={() => setSidebarOpen(false)}
				/>
			)}
			<div className={sidebarClass}>
				<div className="p-4">
					<div className="flex items-center justify-center mb-8">
						<Recycle
							className={`text-green-600 h-8 w-8 ${
								!isSidebarOpen && "mx-auto"
							}`}
						/>
						{isSidebarOpen && (
							<span className="font-bold text-xl">SmartWaste</span>
						)}
					</div>
					<div>
						<button
							onClick={() => setActiveSection("Dashboard")}
							className={`flex items-center w-full p-3 rounded-lg transition-colors
    ${
			activeSection === "Dashboard"
				? "bg-green-50 dark:bg-green-900/20 text-green-600"
				: "hover:bg-gray-100 dark:hover:bg-gray-700"
		}`}
						>
							<TrendingUp className="h-5 w-5" />
							{isSidebarOpen && <span className="ml-3">Dashboard</span>}
						</button>

						<button
							onClick={() => setActiveSection("Locations")}
							className={`flex items-center w-full p-3 rounded-lg transition-colors
    ${
			activeSection === "Locations"
				? "bg-green-50 dark:bg-green-900/20 text-green-600"
				: "hover:bg-gray-100 dark:hover:bg-gray-700"
		}`}
						>
							<MapPin className="h-5 w-5" />
							{isSidebarOpen && <span className="ml-3">Locations</span>}
						</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className={mainContentClass}>
				{/* Top Navigation */}
				<header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between px-6 h-16">
						<button
							onClick={() => setSidebarOpen(!isSidebarOpen)}
							className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							<Menu className="h-5 w-5" />
						</button>

						<div className="flex items-center gap-4">
							{/* Notifications */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<Bell className="h-5 w-5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-80">
									{notifications.map((notification) => (
										<DropdownMenuItem key={notification.id} className="p-3">
											<div>
												<div className="font-medium">{notification.title}</div>
												<div className="text-sm text-gray-500">
													{notification.description}
												</div>
											</div>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Theme Toggle */}
							<Button variant="ghost" size="icon" onClick={toggleDarkMode}>
								{darkMode ? (
									<Moon className="h-5 w-5" />
								) : (
									<Sun className="h-5 w-5" />
								)}
							</Button>

							{/* User Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full"
									>
										<User className="h-5 w-5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem>Profile</DropdownMenuItem>
									<DropdownMenuItem>Settings</DropdownMenuItem>
									<DropdownMenuItem onClick={handleLogout}>
										<LogOut className="h-4 w-4 mr-2" />
										Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>

				{/* Dashboard Content */}
				{activeSection === "Dashboard" && (
					<main className="p-6">
						{/* Alerts */}
						{notifications.map((notification) => (
							<Alert key={notification.id} className="mb-4">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>{notification.description}</AlertDescription>
							</Alert>
						))}

						{/* Stats Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
							{[
								{
									title: "Collection Time",
									value: pickupTime ? pickupTime.toDateString() : "",
									icon: Clock,
								},
								{
									title: "Bin Status",
									value: `${binStatus}% Full`,
									icon: Trash2,
								},

								{ title: "Weekly Progress", value: "+12.5%", icon: TrendingUp },
							].map((stat, index) => (
								<Card key={index}>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											{stat.title}
										</CardTitle>
										<stat.icon className="h-4 w-4 text-gray-500" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{stat.value}</div>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Charts */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Waste Trends</CardTitle>
									<CardDescription>
										Monthly breakdown of waste types
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-[300px]">
										<ResponsiveContainer width="100%" height="100%">
											<LineChart data={sampleData}>
												<span className="text-white">jkgha;h;</span>
												<XAxis dataKey="month" stroke="#888888" />
												<YAxis stroke="#888888" />
												<Tooltip />
												<Line
													type="monotone"
													dataKey="biodegradable"
													stroke="#22c55e"
													strokeWidth={2}
												/>
												<Line
													type="monotone"
													dataKey="nonBiodegradable"
													stroke="#3b82f6"
													strokeWidth={2}
												/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								</CardContent>
							</Card>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
								<div className="mt-6">
									{/* Show Notification if Exists */}
									{notification && (
										<Alert
											className={`mb-4 ${
												notification.type === "success"
													? "bg-green-100 text-green-700"
													: "bg-yellow-100 text-yellow-700"
											}`}
										>
											{notification.type === "success" ? (
												<CheckCircle className="h-5 w-5  dark:text-black" />
											) : (
												<AlertTriangle className="h-5 w-5 dark:text-black" />
											)}
											<AlertDescription>
												{notification.message}
											</AlertDescription>
										</Alert>
									)}

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<Button
											onClick={handleSchedulePickup}
											className=" text-white bg-green-600 hover:bg-green-700"
										>
											Schedule Pickup
										</Button>
										<Button onClick={handleCancelPickup} variant="destructive">
											Cancel Pickup
										</Button>
									</div>
								</div>
							</div>
						</div>
					</main>
				)}

				{activeSection === "Locations" && (
					<div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
						<h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
							Recycling Centers Near You
						</h2>
						{renderLocationError}
						{renderLocations}
					</div>
				)}
			</div>
		</div>
	);
}
