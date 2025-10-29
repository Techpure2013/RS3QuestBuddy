import {
	pgTableCreator,
	integer,
	text,
	pgSchema,
	index,
} from "drizzle-orm/pg-core";

export const app = pgSchema("rs3questbuddy");
export const QuestDetailsView = app.view("QuestDetailsView", {
	quest_id: integer("quest_id"),
	quest_name: text("quest_name"),
	start_point: text("start_point"),
	member_requirement: text("member_requirement"),
	official_length: text("official_length"),
	items_required: text("items_required").array(),
	items_recommended: text("items_recommended").array(),
	enemies_to_defeat: text("enemies_to_defeat").array(),
});

export const createTable = pgTableCreator(
	(name) => `RS3QuestBuddy_${name}Table`,
);

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
	quest_id: q
		.integer()
		.notNull()
		.primaryKey()
		.generatedAlwaysAsIdentity({ startWith: 1 }),
	quest_name: q.text().unique().notNull(),
	quest_age: questage("questAge"),
	quest_series: questseries("questSeries").default("No Series"),
	quest_release_date: q.date("releaseDate", { mode: "string" }),
}));

export const QuestDetails = app.table(
	"QuestDetails",
	(qd) => ({
		quest_id: qd
			.integer()
			.notNull()
			.primaryKey()
			.references(() => Quests.quest_id, { onDelete: "cascade" }),
		quest_name: qd.text("quest_name"),
		start_point: qd.text().notNull(),
		member_requirement: questaccess("member_requirement"),
		official_length: length("official_length"),
		items_required: qd.text("items_required").array(),
		items_recommended: qd.text("items_recommended").array(),
		enemies_to_defeat: qd.text("enemies_to_defeat").array(),
	}),
	(t) => [index("quest_details_quest_id_index").on(t.quest_id)],
);
