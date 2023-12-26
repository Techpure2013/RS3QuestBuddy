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

export const getPriority = (
    words: string | string[]
    //Transcript: string | string[]
): Priority[] => {
    // Ensure words and Transcript are arrays
    const wordArray = Array.isArray(words) ? words : [words];
    // const transcriptArray = Array.isArray(Transcript)
    //     ? Transcript
    //     : [Transcript];

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
                let highestPriority: Priority = "low"; // Default highest priority

                // Loop through other words in wordArray to find the highest priority for the same word
                for (let i = 0; i < wordArray.length; i++) {
                    if (i !== index && wordArray[i] === word) {
                        if (priorities[i] === "high") {
                            highestPriority = "high";
                            break;
                        }
                    }
                }

                if (priorities[index] < highestPriority) {
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
    let shouldUpdateCounters = true; // Flag to control counter updates

    // Initialize titleCounts to keep track of repeated titles
    console.log("Title Counts:", titleCounts);

    transcript.forEach((word, index) => {
        // Normalize the word to ensure case-insensitive matching
        const normalizedWord = word;

        console.log(`Processing word: ${normalizedWord} at index ${index}`);

        let nextWordHighCount = 0;

        // Check if the word is in wordsToTrack
        if (wordsToTrack[normalizedWord]) {
            // Count the occurrences of each title in titlesToTrack
            if (shouldUpdateCounters && wordsToTrack[normalizedWord]) {
                wordCounters[normalizedWord] =
                    (wordCounters[normalizedWord] || 0) + 1;
            }

            console.log(
                `Word counter for ${normalizedWord}: ${wordCounters[normalizedWord]}`
            );

            // If the word has occurred more than 4 times, set its priority to high
            if (wordCounters[normalizedWord] > 7) {
                console.log(`Setting ${normalizedWord} priority to high`);
                wordsToTrack[normalizedWord] = "high";
                wordCounters[normalizedWord] = 0; // Reset the counter
                shouldUpdateCounters = false; // Disable further counter updates
            } else {
                // Adjust priority based on the counter
                if (wordCounters[normalizedWord] >= 5) {
                    if (index === 0) {
                        console.log(
                            `Setting ${normalizedWord} priority to low and nextWordHighCount to 1`
                        );
                        wordsToTrack[normalizedWord] = "low";
                        nextWordHighCount++;
                        shouldUpdateCounters = false; // Disable further counter updates
                    } else if (nextWordHighCount > 3) {
                        console.log(
                            `Setting ${normalizedWord} priority to high and decrementing nextWordHighCount`
                        );
                        wordsToTrack[normalizedWord] = "high";
                        nextWordHighCount--;
                        shouldUpdateCounters = false; // Disable further counter updates
                    }
                }
            }
        }
        wordCounters[normalizedWord] = 0; // Reset the counter
        // Set the priority to high if the title is repeated more than 4 times
        if (titleCounts[transcript[index]] > 4) {
            if (wordsToTrack[normalizedWord]) {
                console.log(
                    `Setting ${normalizedWord} priority to high due to repeated title`
                );
                wordsToTrack[normalizedWord] = "high";
            }
        }
    });

    console.log("Updated wordsToTrack:", wordsToTrack);
};
