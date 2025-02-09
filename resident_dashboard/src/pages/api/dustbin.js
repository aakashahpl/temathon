const API_URL = "http://localhost:4200"; // Adjust if needed

export const fetchDustbinData = async () => {
	try {
		const response = await fetch(`${API_URL}/first`);
		if (!response.ok) {
			throw new Error("Failed to fetch dustbin data");
		}
		return await response.json();
	} catch (error) {
		console.error("Error fetching dustbin:", error);
		return null;
	}
};





