"use client";

async function fileToDataUrl(file: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

async function compressImageIfNeeded(file: File): Promise<Blob | File> {
  if (!file.type || !file.type.startsWith("image/")) {
    return file;
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.82
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function uploadDirectToImagekit(
  file: File,
  folder = "origin-hackathon"
): Promise<{ url: string; publicId: string }> {
  let fileToUpload: Blob | File = file;
  try {
    fileToUpload = await compressImageIfNeeded(file);
  } catch (_e) {
    fileToUpload = file;
  }

  // Primary attempt: Upload to /api/upload
  try {
    const formData = new FormData();
    formData.append("file", fileToUpload, file.name);
    formData.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success && data.url) {
          return {
            url: data.url,
            publicId: data.publicId || file.name,
          };
        }
      }
    }

    // Attempt JSON Base64 upload if multipart failed
    const base64Data = await fileToDataUrl(fileToUpload);
    const jsonRes = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileData: base64Data,
        fileName: file.name,
        mimeType: file.type || "image/png",
      }),
    });

    if (jsonRes.ok) {
      const data = await jsonRes.json();
      if (data.success && data.url) {
        return {
          url: data.url,
          publicId: data.publicId || file.name,
        };
      }
    }
  } catch (err) {
    console.warn("[Imagekit Client] /api/upload endpoint call failed:", err);
  }

  // Ultimate Fail-Safe Fallback: Generate client-side Data URL
  console.log("[Imagekit Client] Falling back to client-side Data URL preview.");
  const fallbackUrl = await fileToDataUrl(fileToUpload);
  return {
    url: fallbackUrl,
    publicId: `data_url_${Date.now()}_${file.name}`,
  };
}