export const getImageDataFromUrl = async (
	url: string
): Promise<ImageData | null> => {
	try {
		const imageResult = await fetch(url);

		if (!imageResult.ok) {
			throw new Error(`Failed to fetch image. Status: ${imageResult.status}`);
		}

		const blob = await imageResult.blob();
		const bitmap = await createImageBitmap(blob);
		const [width, height] = [bitmap.width, bitmap.height];

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (ctx) {
			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(bitmap, 0, 0);

			const imageData = ctx.getImageData(0, 0, width, height);

			canvas.remove();
			return imageData;
		} else {
			throw new Error("Canvas 2D context is not supported.");
		}
	} catch (error) {
		console.error(`Error fetching or processing image`, error);
		return null;
	}
};
