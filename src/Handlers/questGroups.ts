/**
 * Quest Groups Configuration
 *
 * Defines multi-part quests that should be grouped together in the carousel.
 * Each group has a parent name and an ordered list of subquests.
 */

export interface QuestGroup {
  parentName: string;
  subquests: string[]; // In correct completion order
}

/**
 * Multi-part quest groups
 *
 * Order notes:
 * - Recipe for Disaster: Another Cook's Quest must be first, Defeating the Culinaromancer last
 * - Dimension of Disaster: Coin of the Realm must be first, Curse of Arrav last
 * - Once Upon a Time in Gielinor: Sequential order (Foreshadowing -> Finale)
 * - That Old Black Magic: My One and Only Lute must be first, others can be any order
 */
export const QUEST_GROUPS: QuestGroup[] = [
  {
    parentName: "Recipe for Disaster",
    subquests: [
      "Recipe for Disaster: Another Cook's Quest",
      "Recipe for Disaster: Freeing the Goblin Generals",
      "Recipe for Disaster: Freeing the Mountain Dwarf",
      "Recipe for Disaster: Freeing Evil Dave",
      "Recipe for Disaster: Freeing the Lumbridge Sage",
      "Recipe for Disaster: Freeing Pirate Pete",
      "Recipe for Disaster: Freeing Skrach Uglogwee",
      "Recipe for Disaster: Freeing Sir Amik Varze",
      "Recipe for Disaster: Freeing King Awowogei",
      "Recipe for Disaster: Defeating the Culinaromancer",
    ],
  },
  {
    parentName: "Dimension of Disaster",
    subquests: [
      "Dimension of Disaster: Coin of the Realm",
      "Dimension of Disaster: Shield of Arrav",
      "Dimension of Disaster: Demon Slayer",
      "Dimension of Disaster: Defender of Varrock",
      "Dimension of Disaster: Curse of Arrav",
    ],
  },
  {
    parentName: "Once Upon a Time in Gielinor",
    subquests: [
      "Once Upon a Time in Gielinor: Foreshadowing",
      "Once Upon a Time in Gielinor: Flashback",
      "Once Upon a Time in Gielinor: Fortunes",
      "Once Upon a Time in Gielinor: Finale",
    ],
  },
  {
    parentName: "That Old Black Magic",
    subquests: [
      "That Old Black Magic: My One and Only Lute",
      "That Old Black Magic: Skelly By Everlight",
      "That Old Black Magic: Flesh and Bone",
      "That Old Black Magic: Hermy and Bass",
    ],
  },
];

// Build lookup maps for efficient access
const subquestToParent = new Map<string, string>();
const parentToGroup = new Map<string, QuestGroup>();

for (const group of QUEST_GROUPS) {
  parentToGroup.set(group.parentName, group);
  for (const subquest of group.subquests) {
    subquestToParent.set(subquest, group.parentName);
  }
}

/**
 * Check if a quest name is a subquest of a multi-part quest
 */
export function isGroupedSubquest(questName: string): boolean {
  return subquestToParent.has(questName);
}

/**
 * Get the parent group name for a subquest
 * Returns undefined if not a grouped subquest
 */
export function getParentGroupName(questName: string): string | undefined {
  return subquestToParent.get(questName);
}

/**
 * Get the full quest group for a parent name
 */
export function getQuestGroup(parentName: string): QuestGroup | undefined {
  return parentToGroup.get(parentName);
}

/**
 * Get the order index of a subquest within its group (0-based)
 * Returns -1 if not found
 */
export function getSubquestOrder(questName: string): number {
  const parentName = subquestToParent.get(questName);
  if (!parentName) return -1;

  const group = parentToGroup.get(parentName);
  if (!group) return -1;

  return group.subquests.indexOf(questName);
}

/**
 * Get all parent group names
 */
export function getAllParentNames(): string[] {
  return QUEST_GROUPS.map(g => g.parentName);
}
