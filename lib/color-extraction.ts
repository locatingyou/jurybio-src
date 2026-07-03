// work around for cors error with ColorThief
export const extractDominantColor = async (
  imageUrl: string,
): Promise<[number, number, number] | null> => {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise((resolve) => {
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 150;
          canvas.height = 150;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(null);
            return;
          }

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          let r = 0,
            g = 0,
            b = 0;

          // Sample every 4th pixel to avoid CORS issues and improve performance
          for (let i = 0; i < data.length; i += 16) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }

          const pixelCount = data.length / 16;
          let avgR = Math.round(r / pixelCount);
          let avgG = Math.round(g / pixelCount);
          let avgB = Math.round(b / pixelCount);

          // Increase saturation by boosting the dominant channel
          const max = Math.max(avgR, avgG, avgB);
          const min = Math.min(avgR, avgG, avgB);
          const saturation = max - min;

          if (saturation > 0) {
            // Boost the most dominant color and reduce others
            if (avgR === max) avgR = Math.min(255, avgR * 1.3);
            if (avgG === max) avgG = Math.min(255, avgG * 1.3);
            if (avgB === max) avgB = Math.min(255, avgB * 1.3);

            // Slightly reduce the minimum to increase contrast
            if (avgR === min) avgR = Math.max(0, avgR * 0.8);
            if (avgG === min) avgG = Math.max(0, avgG * 0.8);
            if (avgB === min) avgB = Math.max(0, avgB * 0.8);
          }

          resolve([Math.round(avgR), Math.round(avgG), Math.round(avgB)]);
        } catch (err) {
          console.error("Canvas color extraction failed:", err);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.error("Failed to load image for color extraction");
        resolve(null);
      };

      img.src = imageUrl;
    });
  } catch (err) {
    console.error("Color extraction error:", err);
    return null;
  }
};
