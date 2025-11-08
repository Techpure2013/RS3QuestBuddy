import type { QuestSeries, QuestAge } from "./types";

export type QuestRowFull = {
  id: number;
  quest_name: string;
  quest_series: QuestSeries;
  quest_age: QuestAge;
  quest_release_date: string | null;
  created_at: string;
  updated_at: string;
};

export type QuestListFullCache = {
  items: QuestRowFull[];
  total: number;
  updatedAt: string;
};
