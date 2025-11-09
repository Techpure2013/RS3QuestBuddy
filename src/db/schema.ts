import { sql } from "drizzle-orm";
import {
	text,
	pgSchema,
	unique,
	timestamp,
	jsonb,
	uniqueIndex,
	index,
} from "drizzle-orm/pg-core";

export const app = pgSchema("rs3questbuddy");
type NpcLocation = { lat: number; lng: number };
type NpcWanderRadius = {
	bottomLeft: NpcLocation;
	topRight: NpcLocation;
};
type NpcHighlight = {
	id: number;
	npcName: string;
	npcLocation: NpcLocation;
	wanderRadius?: NpcWanderRadius;
};
export type Actions = Array<Record<`${number}`, string | null>>;
export type ActionCursors = Array<Record<`${number}`, number | null>>;
export type NpcLocationEntry = { lat: number; lng: number; floor: number };
export type NpcLocations = NpcLocationEntry[];
export type ObjectLocationPoint = {
	lat: number;
	lng: number;
	color?: string;
	numberLabel?: string;
};
export type ObjectRadius = {
	bottomLeft: NpcLocation;
	topRight: NpcLocation;
};
export type ObjectHighlight = {
	id?: number;
	name: string;
	objectLocation: ObjectLocationPoint[];
	objectRadius?: ObjectRadius;
};
export type QuestHighlights = {
	npc: NpcHighlight[];
	object: ObjectHighlight[];
};
export type QuestImage = {
	step: number;
	src: string;
	height: number;
	width: number;
	stepDescription: string;
};
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
export const questStatus = app.enum("quest_status", [
	"draft",
	"in_progress",
	"published",
	"archived",
]);

export const stepStatus = app.enum("step_status", ["draft", "ready"]);
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

export const Quests = app.table(
	"Quests",
	(q) => ({
		total_steps: q.integer(),
		id: q
			.integer()
			.notNull()
			.primaryKey()
			.generatedAlwaysAsIdentity({ startWith: 1 }),

		quest_name: q.text().unique().notNull(),
		quest_age: questage("quest_age"),
		quest_series: questseries("quest_series").default("No Series"),
		quest_release_date: q.date("release_date", { mode: "string" }),
		created_at: timestamp("created_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("idx_quest_age").on(t.quest_age),
		index("idx_quest_series").on(t.quest_series),
		index("idx_quest_release_date").on(t.quest_release_date),
	],
);

export const QuestDetails = app.table(
	"QuestDetails",
	(qd) => ({
		id: qd.integer().primaryKey().generatedByDefaultAsIdentity(),
		quest_id: qd
			.integer()
			.notNull()
			.references(() => Quests.id, { onDelete: "cascade" }),
		start_point: qd.text().notNull(),
		member_requirement: questaccess("member_requirement"),
		official_length: length("official_length"),
		quest_requirements: text("quest_requirements").array().default([]),
		items_required: qd.text("items_required").array().default([]),
		items_recommended: qd.text("items_recommended").array().default([]),
		enemies_to_defeat: qd.text("enemies_to_defeat").array().default([]),
		created_at: timestamp("created_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
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
		quest_requirements: qrh.text("quest_requirements").array().default([]),

		createdAt: qrh
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`),
	}),
);

export const NpcTable = app.table(
	"NPCTable",
	(n) => ({
		id: n.integer().primaryKey().notNull(),
		name: n.text().notNull(),
		models: n.integer().array(),
		head_models: n.integer().array(),
		color_replacements: jsonb("color_replacements").$type<[number, number][]>(),
		material_replacements: jsonb("material_replacements").$type<
			[number, number][]
		>(),
		actions: jsonb("actions").$type<Actions>(),
		action_cursors: jsonb("action_cursors").$type<ActionCursors>(),
		location: jsonb("location").$type<NpcLocations>(),
		npc_combat_level: n.integer().array(),
		animation_group: n.integer().array(),
		movement_capabilities: n.integer().array(),
		bound_size: n.integer(),
		created_at: timestamp("created_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [index("idx_npc_name").on(t.name)],
);

export const QuestSteps = app.table(
	"quest_steps",
	(t) => ({
		id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
		quest_id: t
			.integer()
			.notNull()
			.references(() => Quests.id, { onDelete: "cascade" }),
		step_number: t.integer().notNull(),
		step_description: t.text().notNull(),
		items_needed: text("items_needed").array().notNull().default([]),
		items_recommended: text("items_recommended").array().notNull().default([]),
		highlights: jsonb("highlights")
			.$type<QuestHighlights>()
			.notNull()
			.default(sql`'{"npc":[],"object":[]}'::jsonb`),
		additional_info: text("additional_info").array().notNull().default([]),
		floor: t.integer("floor").notNull().default(0),
		status: questStatus("status").notNull().default("draft"),
		created_at: timestamp("created_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		uniqueIndex("uq_quest_step_no").on(t.quest_id, t.step_number),
		index("idx_steps_quest").on(t.quest_id),
		index("idx_steps_status").on(t.status),
	],
);
export const StepDescriptionHistory = app.table(
	"quest_step_description_history",
	(t) => ({
		id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
		step_id: t
			.integer()
			.notNull()
			.references(() => QuestSteps.id, { onDelete: "cascade" }),
		old_description: t.text().notNull(),
		changed_at: timestamp("changed_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		changed_by: t.text("changed_by"),
		change_note: t.text("change_note"),
	}),
);
export const StepAdditionalInfoHistory = app.table(
	"quest_step_additional_info_history",
	(t) => ({
		id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
		step_id: t
			.integer()
			.notNull()
			.references(() => QuestSteps.id, { onDelete: "cascade" }),
		old_additional_info: text("old_additional_info").$type<string[]>().notNull(),
		changed_at: timestamp("changed_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		changed_by: t.text("changed_by"),
		change_note: t.text("change_note"),
	}),
);
export const StepHighlightsHistory = app.table(
	"quest_step_highlights_history",
	(t) => ({
		id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
		step_id: t
			.integer()
			.notNull()
			.references(() => QuestSteps.id, { onDelete: "cascade" }),
		old_highlights: jsonb("old_highlights").$type<QuestHighlights>().notNull(),
		changed_at: timestamp("changed_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		changed_by: t.text("changed_by"),
		change_note: t.text("change_note"),
	}),
);
export const StepStatusHistory = app.table(
	"quest_step_status_history",
	(t) => ({
		id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
		step_id: t
			.integer()
			.notNull()
			.references(() => QuestSteps.id, { onDelete: "cascade" }),
		from_status: questStatus("from_status").notNull(),
		to_status: questStatus("to_status").notNull(),
		changed_at: timestamp("changed_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		changed_by: t.text("changed_by"),
		change_note: t.text("change_note"),
	}),
);
export const QuestRewards = app.table(
	"QuestRewards",
	(qr) => ({
		id: qr.integer().primaryKey().generatedByDefaultAsIdentity(),
		quest_id: qr.integer().references(() => Quests.id),
		quest_points: qr.integer().notNull(),
		quest_rewards: qr.text().array(),
		created_at: timestamp("created_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [index("idx_qrewards_quest").on(t.quest_id)],
);
export const QuestImages = app.table(
	"QuestImages",
	(qi) => ({
		id: qi.integer().primaryKey().generatedByDefaultAsIdentity(),
		quest_id: qi.integer().references(() => Quests.id),
		images: jsonb("images")
			.$type<QuestImage[]>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		created_at: timestamp("created_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [index("idx_questimages_quest").on(t.quest_id)],
);
export const schema = {
	Quests,
	QuestDetails,
	QuestRequirementsHistory,
	NpcTable,
	QuestSteps,
	StepDescriptionHistory,
	StepAdditionalInfoHistory,
	StepHighlightsHistory,
	StepStatusHistory,
	QuestRewards,
	QuestImages,
};
