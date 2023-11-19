export const getImageDataFromUrl = async (url: string) => {
    const imageResult = await fetch(url);

    const bitmap = await createImageBitmap(await imageResult.blob());
    const [width, height] = [bitmap.width, bitmap.height];

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(bitmap, 0, 0);

    const imageData = ctx?.getImageData(0, 0, width, height);

    canvas.remove();

    return imageData;
};
