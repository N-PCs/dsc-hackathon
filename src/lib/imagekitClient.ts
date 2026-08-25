const publicKey = import.meta.env?.VITE_IMAGEKIT_PUBLIC_KEY || (typeof process !== 'undefined' ? process.env?.IMAGEKIT_PUBLIC_KEY : '') || '';
const privateKey = (typeof process !== 'undefined' ? process.env?.IMAGEKIT_PRIVATE_KEY : '') || '';

export async function uploadDirectToImagekit(
  file: File,
  folder = 'origin-hackathon'
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  let data: any;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(text || `Upload server returned status ${response.status}`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data?.message || 'File upload failed');
  }

  return {
    url: data.url,
    publicId: data.publicId || file.name,
  };
}
