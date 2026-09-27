export function extractLsbPlane(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): ImageData {
  const output = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const pixelIndex = (i * width + j) * 4;

      output[pixelIndex] = pixels[pixelIndex] & 1 ? 255 : 0;
      output[pixelIndex + 1] = pixels[pixelIndex + 1] & 1 ? 255 : 0;
      output[pixelIndex + 2] = pixels[pixelIndex + 2] & 1 ? 255 : 0;
      output[pixelIndex + 3] = 255;
    }
  }

  return new ImageData(output, width, height);
}
