import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = import.meta.env.VITE_AWS_BUCKET_NAME;
const REGION = import.meta.env.VITE_AWS_REGION;
const ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const SECRET_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

const checkEnv = () => {
  if (!BUCKET || !REGION || !ACCESS_KEY || !SECRET_KEY) {
    console.error("S3 Configuration Error: Missing environment variables. Please check your .env file.");
    return false;
  }
  return true;
};

const s3Client = new S3Client({
  region: REGION || 'us-east-1',
  credentials: {
    accessKeyId: ACCESS_KEY || '',
    secretAccessKey: SECRET_KEY || '',
  },
});

const MANIFEST_KEY = 'gallery.json';
const ABOUT_KEY = 'about.json';

// Direct public URL — no signing needed
function publicUrl(key: string | undefined) {
  if (!key) return undefined;
  if (key.startsWith('http')) return key;
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

export const uploadToS3 = async (file: File, folder: string = 'art') => {
  if (!checkEnv()) throw new Error("S3 environment variables not configured.");

  const fileName = `${folder}/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const body = new Uint8Array(arrayBuffer);
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileName,
    Body: body,
    ContentType: file.type,
  });

  try {
    await s3Client.send(command);
    return fileName;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

export const fetchGallery = async () => {
  try {
    const res = await fetch(publicUrl(MANIFEST_KEY)!, { cache: 'no-store' });
    if (!res.ok) return [];
    const rawGallery = await res.json();

    return rawGallery.map((art: any) => {
      const key = art.key || art.url;
      const url = publicUrl(key);
      return { ...art, url, key };
    });
  } catch {
    return [];
  }
};

export const updateGallery = async (newArtData: { id: number; title: string; category: string; key: string }) => {
  const currentGallery = await fetchGallery();
  const cleanGallery = currentGallery.map(({ url, ...rest }: any) => rest);
  const updatedGallery = [newArtData, ...cleanGallery];

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: MANIFEST_KEY,
    Body: JSON.stringify(updatedGallery),
    ContentType: 'application/json',
  }));

  return fetchGallery();
};

export const deleteArtwork = async (artId: number, artKey?: string) => {
  if (artKey) {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: artKey }));
    } catch (error) {
      console.error("Failed to delete S3 object:", error);
    }
  }

  const currentGallery = await fetchGallery();
  const cleanGallery = currentGallery
    .filter((art: any) => art.id !== artId)
    .map(({ url, ...rest }: any) => rest);

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: MANIFEST_KEY,
    Body: JSON.stringify(cleanGallery),
    ContentType: 'application/json',
  }));

  return fetchGallery();
};

export const fetchAbout = async () => {
  try {
    const res = await fetch(publicUrl(ABOUT_KEY)!, { cache: 'no-store' });
    if (!res.ok) return null;
    const about = await res.json();
    if (about.profilePic) {
      about.profilePicUrl = publicUrl(about.profilePic);
    }
    return about;
  } catch {
    return null;
  }
};

export const updateAbout = async (aboutData: any) => {
  const { profilePicUrl, ...dataToSave } = aboutData;

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: ABOUT_KEY,
    Body: JSON.stringify(dataToSave),
    ContentType: 'application/json',
  }));

  return aboutData;
};
