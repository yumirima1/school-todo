import { PrepPack } from "@/lib/prep";
import { StudyMaterial } from "@/lib/types";

export type MaterialMatch = {
  item: string;
  material?: StudyMaterial;
};

export function matchMaterialsForPack(
  pack: PrepPack,
  materials: StudyMaterial[],
): MaterialMatch[] {
  const activeMaterials = materials.filter(
    (material) => material.active && material.subjectId === pack.subjectId,
  );

  return pack.items.map((item) => {
    const normalizedItem = item.toLowerCase();
    const material = activeMaterials.find((candidate) => {
      const title = candidate.title.toLowerCase();
      const shortTitle = candidate.shortTitle.toLowerCase();
      return (
        normalizedItem.includes(title) ||
        normalizedItem.includes(shortTitle) ||
        title.includes(normalizedItem) ||
        shortTitle.includes(normalizedItem)
      );
    });

    return { item, material };
  });
}

export async function resizeImageToDataUrl(file: File, maxWidth = 400) {
  const image = await loadImage(file);
  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context is not available.");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像を読み込めませんでした。"));
    };
    image.src = url;
  });
}
