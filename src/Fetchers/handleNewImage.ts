import { useEffect } from "react";
import { create } from "zustand";

// Define the interface for individual image data
interface QuestImage {
  step: string;
  src: string;
  width: number;
  height: number;
}
type ImageType = {
  step: string;
  src: string;
  width: number;
  height: number;
};
// Define the type for the Zustand store
type QuestImageStore = {
  imageList: QuestImage[];
  setQuestImages: (images: QuestImage[]) => void;
};

// Create the Zustand store for managing the quest images
export const UseImageStore = create<QuestImageStore>((set) => ({
  imageList: [],
  setQuestImages: (images: QuestImage[]) => set({ imageList: images }),
}));

// Define the interface for the component's props (questName and QuestListJSON)
interface QuestImageType {
  questName: string;
  QuestListJSON: string;
}

// QuestImageFetcher component that fetches and sets images
export const QuestImageFetcher: React.FC<QuestImageType> = ({
  questName,
  QuestListJSON,
}) => {
  const { setQuestImages } = UseImageStore();

  const fetchImages = async () => {
    try {
      // Fetch the JSON from the provided URL
      const response = await fetch(QuestListJSON);
      const imageList = await response.json();
      console.log("Image List", imageList);
      // Check if the fetched data is an array
      if (!Array.isArray(imageList)) {
        console.error("QuestImageList.json is not an array.");
        return;
      }

      // Sanitize the questName string for matching purposes
      const sanitizeString = (input: string) =>
        input.replace(/[^\w\s]/gi, "").toLowerCase();

      const sanitizedQuestName = sanitizeString(questName.trim());

      // Find the quest data from the imageList
      const questInfo = imageList.find((quest: { name: string }) => {
        if (quest.name) {
          const sanitizedQuestNameInList = sanitizeString(quest.name.trim());
          console.log(sanitizedQuestNameInList, sanitizedQuestName);
          return sanitizedQuestNameInList === sanitizedQuestName;
        }
        return false; // Skip entries without a name
      });
      console.log(questInfo);
      // If questInfo is not found or does not have images, log an error
      if (!questInfo || !Array.isArray(questInfo.images)) {
        console.error(
          `Images not found or not an array for questName: ${questName}`
        );
        return;
      }

      // Process the images from the questInfo
      const questImages: QuestImage[] = questInfo.images
        .filter(
          (image: ImageType) =>
            typeof image.src === "string" && image.src.endsWith(".png")
        )
        .map((image: ImageType, index: number) => ({
          step: image.step, // Fallback to the index if no step is provided
          src: `./../Images/${questName.trim().replace(":", "")}/${image.src}`,
          width: image.width,
          height: image.height,
        }));

      // Update the Zustand store with the new images
      setQuestImages(questImages);
    } catch (error) {
      console.error("Error fetching or processing QuestImageList.json:", error);
    }
  };

  // Run the fetchImages function whenever questName changes
  useEffect(() => {
    fetchImages();
  }, [questName, setQuestImages]);

  return null; // No UI to render here, just a side-effect hook
};

export default QuestImageFetcher;
