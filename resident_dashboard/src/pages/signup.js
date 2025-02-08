import { useState } from "react";
import { useRouter } from "next/router";
import {
	FaRecycle,
	FaEnvelope,
	FaLock,
	FaUser,
	FaGoogle,
} from "react-icons/fa";
import Head from "next/head";
import { auth, provider, signInWithPopup } from "../lib/firebase";

export default function SignUp() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}
		console.log("Signup attempt:", formData);
	};

	const handleGoogleSignIn = async () => {
		try {
			const result = await signInWithPopup(auth, provider);
			console.log("User:", result.user);
			router.push("/dashboard"); // Redirect after login
		} catch (error) {
			console.error("Google Sign-In Error:", error);
		}
	};

	return (
		<>
			<Head>
				<title>Sign Up - SmartWaste</title>
				<meta name="description" content="Create your SmartWaste account" />
			</Head>

			<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<div
						onClick={() => router.push("/")}
						className="flex justify-center items-center cursor-pointer"
					>
						<FaRecycle className="text-green-600 text-4xl" />
						<span className="ml-2 text-2xl font-bold text-green-700">
							SmartWaste
						</span>
					</div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Create your account
					</h2>
				</div>

				<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
					<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
						<button
							onClick={handleGoogleSignIn}
							className="w-full flex items-center justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
						>
							<FaGoogle className="text-red-500 mr-2" />
							Sign Up with Google
						</button>

						<div className="flex items-center my-4">
							<hr className="w-full border-gray-300" />
							<span className="px-2 text-gray-500 text-sm">OR</span>
							<hr className="w-full border-gray-300" />
						</div>
						<form className="space-y-6" onSubmit={handleSubmit}>
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700"
								>
									Full Name
								</label>
								<div className="mt-1 relative rounded-md shadow-sm">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<FaUser className="h-5 w-5 text-gray-400" />
									</div>
									<input
										id="name"
										name="name"
										type="text"
										required
										className="pl-10 text-black focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
										placeholder="John Doe"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700"
								>
									Email address
								</label>
								<div className="mt-1 relative rounded-md shadow-sm">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<FaEnvelope className="h-5 w-5 text-gray-400" />
									</div>
									<input
										id="email"
										name="email"
										type="email"
										required
										className="pl-10 text-black focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
										placeholder="you@example.com"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700"
								>
									Password
								</label>
								<div className="mt-1 relative rounded-md shadow-sm">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<FaLock className="h-5 w-5 text-gray-400" />
									</div>
									<input
										id="password"
										name="password"
										type="password"
										required
										className="pl-10 text-black focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
										placeholder="••••••••"
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-medium text-gray-700"
								>
									Confirm Password
								</label>
								<div className="mt-1 relative rounded-md shadow-sm">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<FaLock className="h-5 w-5 text-gray-400" />
									</div>
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										required
										className="pl-10 text-black focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
										placeholder="••••••••"
										value={formData.confirmPassword}
										onChange={(e) =>
											setFormData({
												...formData,
												confirmPassword: e.target.value,
											})
										}
									/>
								</div>
							</div>

							<div>
								<button
									type="submit"
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
								>
									Create Account
								</button>
							</div>
						</form>

						<div className="mt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">
										Already have an account?
									</span>
								</div>
							</div>

							<div className="mt-6">
								<button
									onClick={() => router.push("/login")}
									className="w-full flex justify-center py-2 px-4 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50"
								>
									Sign in instead
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
