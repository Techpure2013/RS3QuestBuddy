export type ImageType = {
  step: string;
  src: string;
  width: number;
  height: number;
};

const sanitizeString = (input: string) =>
  input.replace(/[^\w\s]/gi, "").toLowerCase();

export const fetchQuestImages = async (
  questName: string,
  questListJSON: string
): Promise<{ images: ImageType[]; error: string | null }> => {
  try {
    const response = await fetch("questListJSON");
    const imageList = await response.json();

    if (!Array.isArray(imageList)) {
      throw new Error("QuestImageList.json is not an array.");
    }

    const questInfo = imageList.find(
      (quest: { name: string }) =>
        sanitizeString(quest.name || "") === sanitizeString(questName.trim())
    );

    if (!questInfo || !Array.isArray(questInfo.images)) {
      throw new Error(`Quest info or images not found for quest: ${questName}`);
    }

    const imagePromises = questInfo.images
      .filter((filename: string) => filename.toLowerCase().endsWith(".png"))
      .map((filename: string, index: number) => {
        const src = `./../Images/${questName
          .trim()
          .replace(":", "")}/${filename.trim()}`;
        return new Promise<ImageType>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () =>
            resolve({
              step: `Step ${index + 1}`,
              src,
              width: img.width,
              height: img.height,
            });
          img.onerror = () =>
            resolve({
              step: `Step ${index + 1}`,
              src,
              width: 0,
              height: 0,
            });
        });
      });

    const imageDetails = await Promise.all(imagePromises);

    return { images: imageDetails, error: null };
  } catch (err: any) {
    return { images: [], error: err.message || "Unknown error occurred" };
  }
};
