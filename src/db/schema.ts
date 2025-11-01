import { sql } from "drizzle-orm";
import { pgTableCreator, text, pgSchema, unique } from "drizzle-orm/pg-core";

export const app = pgSchema("rs3questbuddy");

export const createTable = pgTableCreator((name) => `RS3-Quest-Buddy_${name}`);

// Enums
export const questage = app.enum("questAge", [
	"Ambiguous",
	"None",
	"Fifth or Sixth Age",
	"Fifth Age",
	"Ambiguous (Fits into Either Ages)",
	"Sixth Age",
	"Age of Chaos",
]);

export const questseries = app.enum("questSeries", [
	"No Series",
	"Delrith",
	"Pirate",
	"Fairy",
	"Camelot",
	"Gnome",
	"Elf (Prifddinas)",
	"Ogre",
	"Elemental Workshop",
	"Myreque",
	"Troll",
	"Fremennik",
	"Desert",
	"Cave Goblin",
	"Dwarf (Red Axe)",
	"Temple Knight",
	"Enchanted Key",
	"Odd Old Man",
	"Wise Old Man",
	"Penguin",
	"TzHaar",
	"Summer",
	"Thieves' Guild",
	"Void Knight",
	"Fremennik Sagas",
	"Ozan",
	"Doric's Tasks",
	"Boric's Tasks",
	"Ariane",
	"Tales of the Arc",
	"Violet Tendencies",
	"Seasons",
	"Mahjarrat Mysteries",
	"Sliske's Game",
	"The Elder God Wars",
	"Legacy of Zamorak",
	"Fort Forinthry",
	"The First Necromancer",
	"City of Um",
]);

export const questaccess = app.enum("requirement", [
	"Free to Play",
	"Members Only",
]);

export const length = app.enum("length", [
	"Very Short",
	"Short",
	"Short to Medium",
	"Medium",
	"Medium to Long",
	"Long",
	"Very Long",
	"Very Very Long",
]);

export const Quests = app.table("Quests", (q) => ({
	id: q
		.integer()
		.notNull()
		.primaryKey()
		.generatedAlwaysAsIdentity({ startWith: 1 }),
	quest_name: q.text().unique().notNull(),
	quest_age: questage("quest_age"),
	quest_series: questseries("quest_series").default("No Series"),
	quest_release_date: q.date("release_date", { mode: "string" }),
}));

export const QuestDetails = app.table(
	"QuestDetails",
	(qd) => ({
		id: qd.integer().primaryKey().generatedByDefaultAsIdentity(),
		quest_id: qd
			.integer()
			.notNull()
			.references(() => Quests.id, { onDelete: "cascade" }),
		quest_name: qd.text("quest_name"),
		start_point: qd.text().notNull(),
		member_requirement: questaccess("member_requirement"),
		official_length: length("official_length"),
		quest_requirements: text("quest_requirements").array(),
		items_required: qd.text("items_required").array(),
		items_recommended: qd.text("items_recommended").array(),
		enemies_to_defeat: qd.text("enemies_to_defeat").array(),
	}),
	(t) => [[unique("quest_details_quest_id_key").on(t.quest_id)]],
);
export const QuestRequirementsHistory = app.table(
	"QuestRequirementsHistory",
	(qrh) => ({
		id: qrh.integer().primaryKey().generatedByDefaultAsIdentity(),
		quest_details_id: qrh
			.integer("questDetailsID")
			.references(() => QuestDetails.id, { onDelete: "cascade" }),
		quest_requirements: qrh.text("quest_requirements").array(),

		createdAt: qrh
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`),
	}),
);
export const QuestGuide = app.table("QuestGuide", (qg) => ({
	id: qg.integer().primaryKey().generatedByDefaultAsIdentity(),
	quest_id: qg.integer().references(() => Quests.id),
	quest_name: qg.text(),
	items_needed: qg.text().array(),
	items_recommended: qg.text().array(),
}));

export const Highlights = app.table("guideHighlights", (hl) => ({}));
