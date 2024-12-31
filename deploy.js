const express = require("express");
const path = require("path");

const app = express();

// Serve the Webpack bundle (static files)
app.use(express.static(path.join(__dirname, "dist")));

// Handle SPA fallback to `index.html`
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
