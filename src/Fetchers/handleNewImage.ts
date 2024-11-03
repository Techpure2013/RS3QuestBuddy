import { useEffect } from "react";
import { create } from "zustand";

// Updated interface for the image data structure in JSON
interface QuestImageType {
	questName: string;
	QuestListJSON: string;
}

// Interface to represent individual image data, including dimensions
interface QuestImage {
	step: string;
	src: string;
	width: number;
	height: number;
}

// Type for the zustand store
type QuestImageStore = {
	imageList: QuestImage[];
	setQuestImages: (images: QuestImage[]) => void;
};

// Zustand store for managing quest images
export const UseImageStore = create<QuestImageStore>((set) => ({
	imageList: [],
	setQuestImages: (images) => set({ imageList: images }),
}));

// QuestImageFetcher component to fetch and parse JSON, update store
export const QuestImageFetcher: React.FC<QuestImageType> = ({
	questName,
	QuestListJSON,
}) => {
	const { setQuestImages } = UseImageStore();

	const fetchImages = async () => {
		try {
			const response = await fetch(QuestListJSON);
			const imageList = await response.json();

			// Check if imageList is an array
			if (!Array.isArray(imageList)) {
				console.error("QuestImageList.json is not an array.");
				return;
			}

			// Helper function to sanitize quest names
			const sanitizeString = (input: string) =>
				input.replace(/[^\w\s]/gi, "").toLowerCase();
			const sanitizedQuestName = questName.trim();

			// Find quest object by matching sanitized name
			const questInfo = imageList.find(
				(quest: { name: string }) =>
					quest.name &&
					sanitizeString(quest.name) === sanitizeString(sanitizedQuestName)
			);

			if (!questInfo || !Array.isArray(questInfo.images)) {
				console.error(
					`Images not found or not an array for questName: ${questName}`
				);
				return;
			}

			// Extract and filter valid images with .png extensions
			const questImages: QuestImage[] = questInfo.images
				.filter(
					(image: any) => typeof image.src === "string" && image.src.endsWith(".png")
				)
				.map((image: any, index: number) => ({
					step: image.step || index.toString(), // Use `image.step` if available, otherwise fallback to `index`
					src: `./Images/${questName.trim().toLowerCase().replace(":", "").trim()}/${
						image.src
					}`,
					width: image.width,
					height: image.height,
				}));

			setQuestImages(questImages);
		} catch (error) {
			console.error("Error fetching or processing QuestImageList.json:", error);
		}
	};

	// Run fetchImages whenever questName changes
	useEffect(() => {
		fetchImages();
	}, [questName, setQuestImages]);

	return null;
};

export default QuestImageFetcher;
