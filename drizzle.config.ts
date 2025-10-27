// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!, // provided by your .env at runtime
	},
	strict: true,
	verbose: true,
});
