import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { FaRecycle, FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import Head from "next/head";
import { auth, provider, signInWithPopup } from "../lib/firebase";
export default function Login() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		router.push("/dashboard");
		console.log("Login attempt:", formData);
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
				<title>Login - SmartWaste</title>
				<meta name="description" content="Login to your SmartWaste account" />
			</Head>

			<div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-6">
	
				<div
					onClick={() => router.push("/")}
					className="flex items-center cursor-pointer mb-6"
				>
					<FaRecycle className="text-green-600 text-4xl" />
					<span className="ml-2 text-2xl font-bold text-green-700">
						SmartWaste
					</span>
				</div>

				<div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
					<h2 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
						Sign in
					</h2>


					<button
						onClick={handleGoogleSignIn}
						className="w-full flex items-center justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
					>
						<FaGoogle className="text-red-500 mr-2" />
						Sign in with Google
					</button>

					<div className="flex items-center my-4">
						<hr className="w-full border-gray-300" />
						<span className="px-2 text-gray-500 text-sm">OR</span>
						<hr className="w-full border-gray-300" />
					</div>

					<form className="space-y-4" onSubmit={handleSubmit}>
				
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email
							</label>
							<div className="relative mt-1">
								<FaEnvelope className="absolute left-3 top-3 text-gray-400" />
								<input
									id="email"
									name="email"
									type="email"
									required
									className="pl-10 text-black pr-4 py-2 w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
							<div className="relative mt-1">
								<FaLock className="absolute left-3 top-3 text-gray-400" />
								<input
									id="password"
									name="password"
									type="password"
									required
									className="pl-10 text-black pr-4 py-2 w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
									placeholder="••••••••"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
								/>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									className="h-4 w-4 text-green-600 border-gray-300 rounded"
								/>
								<label
									htmlFor="remember-me"
									className="ml-2 text-sm text-gray-900"
								>
									Remember me
								</label>
							</div>
							<a
								href="#"
								className="text-sm text-green-600 hover:text-green-500"
							>
								Forgot password?
							</a>
						</div>

						<button
							type="submit"
							className="w-full py-2 px-4 text-white font-medium bg-green-600 hover:bg-green-700 rounded-md"
						>
							Sign in
						</button>
					</form>

					<p className="mt-4 text-center text-sm text-gray-600">
						Don't have an account?{" "}
						<span
							onClick={() => router.push("/signup")}
							className="text-green-600 cursor-pointer"
						>
							Create one
						</span>
					</p>
				</div>
			</div>
		</>
	);
}
