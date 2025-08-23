import { useEffect } from "react";
import { create } from "zustand";

export interface QuestImage {
	step: string;
	src: string;
	width: number;
	height: number;
	stepDescription: string;
}

type ImageType = {
	step: string;
	src: string;
	width: number;
	height: number;
	stepDescription: string;
};

type QuestImageStore = {
	imageList: QuestImage[];
	setQuestImages: (images: QuestImage[]) => void;
};

export const UseImageStore = create<QuestImageStore>((set) => ({
	imageList: [],
	setQuestImages: (images: QuestImage[]) => set({ imageList: images }),
}));

interface QuestImageType {
	questName: string;
	QuestListJSON: string;
}

export const QuestImageFetcher: React.FC<QuestImageType> = ({
	questName,
	QuestListJSON,
}) => {
	const { setQuestImages } = UseImageStore();

	useEffect(() => {
		const fetchImages = async () => {
			try {
				const response = await fetch(QuestListJSON);
				const imageList = await response.json();

				if (!Array.isArray(imageList)) {
					console.error("QuestImageList.json is not an array.");
					return;
				}

				const sanitizeString = (input: string) =>
					input.replace(/[^\w\s]/gi, "").toLowerCase();

				const sanitizedQuestName = sanitizeString(questName.trim());

				const questInfo = imageList.find((quest: { name: string }) => {
					if (quest.name) {
						const sanitizedQuestNameInList = sanitizeString(quest.name.trim());
						return sanitizedQuestNameInList === sanitizedQuestName;
					}
					return false;
				});

				if (!questInfo || !Array.isArray(questInfo.images)) {
					setQuestImages([]); // Clear images if quest not found
					return;
				}

				const questImages: QuestImage[] = questInfo.images
					.filter(
						(image: ImageType) =>
							typeof image.src === "string" && image.src.endsWith(".webp"),
					)
					.map((image: ImageType, index: number) => ({
						// FIX: Added the 'step' property back for completeness
						step: image.step || (index + 1).toString(),
						src: `./Images/${questName.trim().replace(":", "")}/${image.src}`,
						width: image.width,
						height: image.height,
						stepDescription: image.stepDescription,
					}));

				setQuestImages(questImages);
			} catch (error) {
				console.error("Error fetching or processing QuestImageList.json:", error);
			}
		};

		fetchImages();
	}, [questName, QuestListJSON, setQuestImages]);

	return null;
};

export default QuestImageFetcher;
