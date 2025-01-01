const express = require("express");
const path = require("path");

const app = express();

// Serve the Webpack bundle (static files) from public_html/RS3QuestBuddy
app.use(
	express.static(path.join(__dirname, "public_html", "RS3QuestBuddyTest"))
);

// Handle SPA fallback to `index.html` from public_html/RS3QuestBuddy
app.get("*", (req, res) => {
	res.sendFile(
		path.join(__dirname, "public_html", "RS3QuestBuddyTest", "index.html")
	);
});

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
