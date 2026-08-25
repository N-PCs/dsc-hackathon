import path from 'path';

const publicKey = import.meta.env?.VITE_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY || '';
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || '';

export async function uploadDirectToImagekit(
  file: File,
  folder = 'origin-hackathon'
): Promise<{ url: string; publicId: string }> {
  const endpoint = `https://upload.imagekit.io/api/v1/files/upload`;
  const authHeader = 'Basic ' + btoa(privateKey + ':');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('folder', folder);
  formData.append('useUniqueFileName', 'true');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ImageKit Direct Upload Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return {
    url: result.url,
    publicId: result.fileId || file.name,
  };
}
