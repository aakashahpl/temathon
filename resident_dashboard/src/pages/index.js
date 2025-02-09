import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
	FaRecycle,
	FaTrashAlt,
	FaLeaf,
	FaChartLine,
	FaCheck,
	FaArrowRight,
	FaMapMarkerAlt,
	FaPhone,
	FaEnvelope,
	FaBars,
	FaTimes,
	FaTwitter,
	FaLinkedin,
	FaFacebook,
	FaInstagram,
} from "react-icons/fa";

export default function Home() {
	const router = useRouter();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("");

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);

			// Update active section based on scroll position
			const sections = ["features", "benefits", "contact"];
			const current = sections.find((section) => {
				const element = document.getElementById(section);
				if (element) {
					const bounds = element.getBoundingClientRect();
					return bounds.top <= 100 && bounds.bottom >= 100;
				}
				return false;
			});

			setActiveSection(current || "");
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const benefits = [
		{
			title: "50% Cost Reduction",
			description:
				"Lower your waste management operational costs significantly",
			icon: FaChartLine,
		},
		{
			title: "24/7 Monitoring",
			description: "Real-time tracking and alerts for optimal waste management",
			icon: FaCheck,
		},
		{
			title: "90% Accuracy",
			description: "AI-powered sorting with industry-leading accuracy rates",
			icon: FaRecycle,
		},
		{
			title: "Eco-Friendly",
			description:
				"Reduce your carbon footprint and contribute to sustainability",
			icon: FaLeaf,
		},
	];

	const scrollToSection = (sectionId) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
		setIsMenuOpen(false);
	};

	return (
		<div className="flex flex-col bg-white text-gray-900">
			{/* Navigation */}
			<nav
				className={`fixed top-0 w-full z-50 transition-all duration-300 ${
					isScrolled ? "bg-white shadow-lg" : "bg-transparent"
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16 items-center">
						<div
							onClick={() => router.push("/")}
							className="flex items-center cursor-pointer group"
						>
							<FaRecycle className="text-green-600 text-3xl transform transition-transform group-hover:rotate-180 duration-500" />
							<span className="ml-2 text-xl font-bold text-green-700">
								SmartWaste
							</span>
						</div>

						{/* Mobile Menu Button */}
						<div className="md:hidden">
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="text-gray-600 hover:text-green-600 transition-colors duration-300"
							>
								{isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
							</button>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center">
							<div className="flex space-x-8 mr-8">
								{["features", "benefits", "contact"].map((section) => (
									<button
										key={section}
										onClick={() => scrollToSection(section)}
										className={`text-gray-600 hover:text-green-600 transition-colors duration-300 capitalize ${
											activeSection === section
												? "text-green-600 font-semibold"
												: ""
										}`}
									>
										{section}
									</button>
								))}
							</div>
							<div className="flex space-x-4">
								<button
									onClick={() => router.push("/login")}
									className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105"
								>
									Login
								</button>
								<button
									onClick={() => router.push("/signup")}
									className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
								>
									Sign Up
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Mobile Menu */}
				<div
					className={`md:hidden transition-all duration-300 ${
						isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
					} overflow-hidden bg-white shadow-lg`}
				>
					<div className="px-4 py-2 space-y-2">
						{["features", "benefits", "contact"].map((section) => (
							<button
								key={section}
								onClick={() => scrollToSection(section)}
								className="block w-full text-left py-2 text-gray-600 hover:text-green-600 transition-colors duration-300 capitalize"
							>
								{section}
							</button>
						))}
						<div className="flex flex-col space-y-2 pt-2 border-t">
							<button
								onClick={() => router.push("/login")}
								className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-all duration-300"
							>
								Login
							</button>
							<button
								onClick={() => router.push("/signup")}
								className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
							>
								Sign Up
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section with Parallax */}
			<header className="pt-32 pb-16 px-4 bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
				<div className="absolute inset-0 z-0">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
				</div>
				<div className="max-w-7xl mx-auto text-center relative z-10">
					<h1 className="text-5xl md:text-6xl font-bold text-green-700 mb-6 animate-fade-in">
						Smart Waste Management
					</h1>
					<p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8 animate-slide-up">
						Transform your waste management with AI-powered automation. Reduce
						costs, increase efficiency, and contribute to a sustainable future.
						🌍
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
						<button onClick={()=>{router.push('/signup')}} className="group px-8 py-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
							Get Started Free
							<FaArrowRight className="inline ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
						</button>
					</div>
				</div>
			</header>

			{/* Stats Section with Counter Animation */}
			<section className="py-16 bg-green-700 transform skew-y-1">
				<div className="transform -skew-y-1">
					<div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
						{[
							"10M+ Tons Processed",
							"500+ Cities",
							"98% Accuracy",
							"45% Cost Savings",
						].map((stat, index) => (
							<div
								key={index}
								className="text-center text-white transform hover:scale-105 transition-transform duration-300"
							>
								<h3 className="text-3xl font-bold mb-2">
									{stat.split(" ")[0]}
								</h3>
								<p className="text-green-100">
									{stat.split(" ").slice(1).join(" ")}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section with Hover Effects */}
			<section id="features" className="py-16 px-4">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
						{[
							{
								icon: FaRecycle,
								color: "green",
								title: "Smart Recycling",
								description:
									"AI-powered systems automatically sort and process recyclable materials with industry-leading accuracy.",
							},
							{
								icon: FaTrashAlt,
								color: "red",
								title: "Automated Sorting",
								description:
									"Advanced sensors and machine learning algorithms ensure precise waste classification and sorting.",
							},
							{
								icon: FaLeaf,
								color: "green",
								title: "Eco-Friendly Disposal",
								description:
									"Environmentally conscious disposal methods that minimize landfill impact and maximize recycling.",
							},
						].map((feature, index) => (
							<div
								key={index}
								className="group text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
							>
								<feature.icon
									className={`text-${feature.color}-500 text-6xl mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}
								/>
								<h3 className="text-xl font-bold mb-4">{feature.title}</h3>
								<p className="text-gray-600">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Benefits Section with Card Hover Effects */}
			<section id="benefits" className="py-16 px-4 bg-gray-50">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-4xl font-bold text-center mb-12">
						Why Choose Us
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{benefits.map((benefit, index) => (
							<div
								key={index}
								className="group flex items-start p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
							>
								<benefit.icon className="text-green-500 text-xl mt-1 mr-4 transform transition-transform duration-300 group-hover:scale-125" />
								<div>
									<h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
									<p className="text-gray-600">{benefit.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section with Gradient Animation */}
			<section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
				<div className="max-w-7xl mx-auto text-center relative z-10">
					<h2 className="text-4xl font-bold text-white mb-6">
						Ready to Transform Your Waste Management?
					</h2>
					<p className="text-xl text-green-100 mb-8">
						Join thousands of facilities already benefiting from smart waste
						management.
					</p>
					<button className="group px-8 py-4 bg-white text-green-700 rounded-lg shadow-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
						Start Your Free Trial
						<FaArrowRight className="inline ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
					</button>
				</div>
			</section>

			{/* Contact Section with Hover Effects */}
			<section id="contact" className="py-16 px-4 bg-gray-50">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-4xl font-bold text-center mb-12">Get in Touch</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
						{[
							{
								icon: FaMapMarkerAlt,
								text: "Anna University",
							},
							{ icon: FaPhone, text: "+91 98765 43210" },
							{ icon: FaEnvelope, text: "contact@smartwaste.com" },
						].map((contact, index) => (
							<div
								key={index}
								className="group transition-transform duration-300 transform hover:-translate-y-1"
							>
								<contact.icon className="text-green-600 text-3xl mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-125" />
								<p className="text-gray-600">{contact.text}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer with Hover Effects */}
			<footer className="bg-gray-900 text-white py-12 px-4">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
						{/* Company Info */}
						<div className="col-span-1 md:col-span-2">
							<div className="flex items-center mb-4 group cursor-pointer">
								<FaRecycle className="text-green-500 text-3xl transform transition-transform duration-300 group-hover:rotate-180" />
								<span className="ml-2 text-xl font-bold">SmartWaste</span>
							</div>
							<p className="text-gray-400 mb-4">
								Making waste management smarter and more sustainable for a
								better tomorrow.
							</p>
							<div className="flex space-x-4">
								{[
									{ icon: FaTwitter, href: "#" },
									{ icon: FaLinkedin, href: "#" },
									{ icon: FaFacebook, href: "#" },
									{ icon: FaInstagram, href: "#" },
								].map((social, index) => (
									<a
										key={index}
										href={social.href}
										className="text-gray-400 hover:text-green-500 transition-colors duration-300"
									>
										<social.icon className="text-xl transform hover:scale-110 transition-transform duration-300" />
									</a>
								))}
							</div>
						</div>

						{/* Quick Links */}
						<div>
							<h3 className="font-bold mb-4 text-lg">Quick Links</h3>
							<ul className="space-y-2">
								{["Features", "Benefits", "Contact", "About Us", "Blog"].map(
									(link) => (
										<li key={link}>
											<a
												href={`#${link.toLowerCase()}`}
												className="text-gray-400 hover:text-green-500 transition-colors duration-300 block transform hover:translate-x-2"
											>
												{link}
											</a>
										</li>
									)
								)}
							</ul>
						</div>

						{/* Resources */}
						<div>
							<h3 className="font-bold mb-4 text-lg">Resources</h3>
							<ul className="space-y-2">
								{[
									"Documentation",
									"Support",
									"Privacy Policy",
									"Terms of Service",
								].map((resource) => (
									<li key={resource}>
										<a
											href={`#${resource.toLowerCase().replace(/\s+/g, "-")}`}
											className="text-gray-400 hover:text-green-500 transition-colors duration-300 block transform hover:translate-x-2"
										>
											{resource}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Newsletter Subscription */}
					<div className="border-t border-gray-800 pt-8 mt-8">
						<div className="max-w-md mx-auto text-center">
							<h4 className="text-lg font-semibold mb-4">
								Subscribe to Our Newsletter
							</h4>
							<div className="flex gap-2">
								<input
									type="email"
									placeholder="Enter your email"
									className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500 transition-colors duration-300"
								/>
								<button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
									Subscribe
								</button>
							</div>
						</div>
					</div>

					{/* Copyright */}
					<div className="text-center mt-8 pt-8 border-t border-gray-800">
						<p className="text-gray-400">
							© {new Date().getFullYear()} Smart Waste Management. All rights
							reserved.
						</p>
					</div>
				</div>
			</footer>

			{/* Scroll to Top Button */}
			<button
				onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				className={`fixed bottom-8 right-8 p-2 rounded-full bg-green-600 text-white shadow-lg transition-all duration-300 transform hover:scale-110 ${
					isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
				}`}
			>
				<FaArrowRight className="transform -rotate-90" />
			</button>

			{/* Add global styles */}
			<style jsx global>{`
				@keyframes fade-in {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}

				@keyframes slide-up {
					from {
						transform: translateY(20px);
						opacity: 0;
					}
					to {
						transform: translateY(0);
						opacity: 1;
					}
				}

				.animate-fade-in {
					animation: fade-in 1s ease-out;
				}

				.animate-slide-up {
					animation: slide-up 1s ease-out;
				}

				html {
					scroll-behavior: smooth;
				}

				::selection {
					background-color: #22c55e;
					color: white;
				}
			`}</style>
		</div>
	);
}