export function computeHistogram(imageData: ImageData): { r: number[]; g: number[]; b: number[] } {
  const r = new Array<number>(256).fill(0);
  const g = new Array<number>(256).fill(0);
  const b = new Array<number>(256).fill(0);

  for (let i = 0; i < imageData.data.length; i += 4) {
    r[imageData.data[i]] += 1;
    g[imageData.data[i + 1]] += 1;
    b[imageData.data[i + 2]] += 1;
  }

  return { r, g, b };
}
