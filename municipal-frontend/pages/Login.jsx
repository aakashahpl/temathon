import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, User } from "lucide-react";
import { useRouter } from 'next/router';

export default function Login({ onLoginSuccess }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("admin");
	const router = useRouter();
	const handleLogin = (e) => {
		e.preventDefault();

		if (email === "admin@gmail.com" && password === "1234"&&role=="admin") {
			console.log("Login successful!");
			router.push('/municipal');

		} else if(email === "driver@gmail.com" && password === "asdf"&&role=="driver"){
			console.log("driver login successfully");
			router.push('/driver');
		}else {
			alert("Invalid email, password, or role.");
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
			<div className="w-full max-w-md rounded-2xl p-6 shadow-lg bg-white">
				<h2 className="text-2xl font-bold text-center mb-4">
					Municipal Dashboard Login
				</h2>
				<form onSubmit={handleLogin} className="space-y-4">
					<div className="relative">
						<input
							type="email"
							placeholder="Email"
							className="w-full p-2 border rounded-lg"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="relative">
						<input
							type="password"
							placeholder="Password"
							className="w-full p-2 border rounded-lg"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<div className="relative">
						<select
							className="w-full p-2 border rounded-lg"
							value={role}
							onChange={(e) => setRole(e.target.value)}
							required
						>
							<option value="admin">Admin</option>
							<option value="driver">Driver</option>
						</select>
					</div>
					<button
						type="submit"
						className="w-full bg-blue-600 text-white p-2 rounded-lg"
					>
						Login
					</button>
				</form>
				<div className="text-center mt-3">
					<a href="#" className="text-sm text-blue-600 hover:underline">
						Forgot Password?
					</a>
				</div>
			</div>
		</div>
	);
}