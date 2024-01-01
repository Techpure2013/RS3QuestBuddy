type Priority = "high" | "low";
export type QuestDetail = {
  Quest: string;
  StartPoint: string;
  MemberRequirement: string;
  OfficialLength: string;
  Requirements: string[];
  ItemsRequired: string[];
  Recommended: string[];
  EnemiesToDefeat: string[];
};
export type cTransType = {
  cTransString: string[];
};
interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
}
export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
}) => {
  return (
    <img
      src={src}
      alt={alt || "Image"}
      className={className}
      width={width}
      height={height}
    />
  );
};
let titleCounts: Record<string, number> = {};
let wordCounters: Record<string, number> = {};
let titlesToTrack: string[] = [];
// Define words to track and their initial priorities
const wordsToTrack: Record<string, Priority> = {
  "Yes.": "low",
  "[Any Option]": "low",
  "None right now.": "low",
  // Add more words and priorities as needed
};

export const getPriority = (words: string | string[]): Priority[] => {
  // Ensure words is an array
  const wordArray = Array.isArray(words) ? words : [words];

  // Assign 'high' priority to all words initially
  let priorities: Priority[] = wordArray.map(() => "high");

  // Adjust the priorities based on the counters
  wordArray.forEach((word, index) => {
    if (wordsToTrack[word]) {
      priorities[index] = "low"; // Set the priority to "low"

      // Check if wordCounters count is greater than a specified number
      const threshold = 5; // Change this to your desired threshold
      if (wordCounters[word] > threshold) {
        // Check if there are no higher priority words in other indices
        const isHigherPriority = wordArray
          .filter((_, i) => i !== index && wordArray[i] === word)
          .some((_, i) => priorities[i] === "high");

        if (!isHigherPriority) {
          priorities[index] = "high"; // Upgrade the priority to "high"
        }
      }
    }
  });

  return priorities;
};
export const getTitle = (title: string) => {
  titleCounts[title] = (titleCounts[title] || 0) + 1;
  titlesToTrack.push(title);
};
export const ResetPSystem = () => {
  titleCounts = {};
  titlesToTrack = [];
  wordCounters = {};
};
export const updatePriorityCounters = (transcript: string[]): void => {
  console.log("Updating priority counters...");
  const threshold = 5;

  transcript.forEach((word, index) => {
    const normalizedWord = word; // Normalize to lowercase for case-insensitive matching

    console.log(`Processing word: ${normalizedWord} at index ${index}`);

    // Initialize counters if not present
    wordCounters[normalizedWord] = (wordCounters[normalizedWord] || 0) + 1;
    titleCounts[transcript[index]] = (titleCounts[transcript[index]] || 0) + 1;

    console.log(
      `Word counter for ${normalizedWord}: ${wordCounters[normalizedWord]}`
    );

    // Prioritize based on occurrence and repetition
    if (
      wordCounters[normalizedWord] >= threshold ||
      titleCounts[transcript[index]] > threshold
    ) {
      wordsToTrack[normalizedWord] = "high";
    } else {
      wordsToTrack[normalizedWord] = "low";
    }

    console.log(
      `Setting ${normalizedWord} priority to ${wordsToTrack[normalizedWord]}`
    );
  });

  console.log("Updated wordsToTrack:", wordsToTrack);
};
