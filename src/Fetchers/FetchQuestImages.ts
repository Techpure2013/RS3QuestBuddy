import { useEffect } from "react";
import { create } from "zustand";

interface QuestImageType {
	questName: string;
	QuestListJSON: string;
}
type QuestImage = {
	imageList: string[];
	setQuestImages: (images: string[]) => void;
};
export const UseImageStore = create<QuestImage>((set) => ({
	imageList: [],
	setQuestImages: (image) => set({ imageList: image }),
}));
/**
 * QuestImageFetcher class encapsulates the logic for fetching quest images.
 */
export const QuestImageFetcher: React.FC<QuestImageType> = ({
	questName,
	QuestListJSON,
}) => {
	const { setQuestImages } = UseImageStore();
	const fetchImages = async () => {
		try {
			const response = await fetch(QuestListJSON);
			const imageList = await response.json();

			if (!Array.isArray(imageList)) {
				console.error("QuestImageList.json is not an array.");
				return;
			}

			const sanitizeString = (input: string) => {
				return input.replace(/[^\w\s]/gi, "").toLowerCase();
			};
			const sanitizedQuestName = questName.trim();
			const questInfo = imageList.find((quest: { name: string }) => {
				return (
					quest.name &&
					sanitizeString(quest.name) === sanitizeString(sanitizedQuestName)
				);
			});

			if (!questInfo) {
				console.error(`Quest info not found for questName: ${questName}`);
				return;
			}

			const filteredImages = questInfo.images;
			if (!Array.isArray(filteredImages)) {
				console.error(`Images array not found for questName: ${questName}`);
				return;
			}

			const imagePaths =
				filteredImages.length === 1
					? [
							`./Images/${questName
								.trim()
								.replace(":", "")}/${filteredImages[0].trim()}`,
					  ]
					: filteredImages
							.filter((filename) => filename.toLowerCase().endsWith(".png"))
							.map(
								(filename) =>
									`./Images/${questName
										.trim()
										.replace(":", "")}/${filename.trim()}`
							);

			setQuestImages(imagePaths);
		} catch (error) {
			console.error("Error fetching or processing QuestImageList.json:", error);
		}
	};
	useEffect(() => {
		fetchImages();
	}, [questName, setQuestImages]);

	return null; // or some placeholder UI
};

export default QuestImageFetcher;

// Example usage within a React component
// const imageFetcher = new QuestImageFetcher( /* ... */ );
// imageFetcher.fetchImages();
