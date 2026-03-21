import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

// Helper to sign a key if it exists
async function signUrl(key: string | undefined) {
  if (!key) return undefined;
  if (key.startsWith('http')) return key; // already a URL
  if (!checkEnv()) return undefined;
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Signing failed for", key, error);
    return undefined;
  }
}

export const uploadToS3 = async (file: File, folder: string = 'art') => {
  if (!checkEnv()) throw new Error("S3 environment variables not configured.");
  
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileName,
    Body: file,
    ContentType: file.type,
  });

  try {
    await s3Client.send(command);
    return fileName; // Return the key
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};


export const fetchGallery = async () => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: MANIFEST_KEY,
    });
    const response = await s3Client.send(command);
    const bodyContents = await response.Body?.transformToString();
    if (!bodyContents) return [];
    
    const rawGallery = JSON.parse(bodyContents);
    
    // Generate fresh signed URLs for each artwork
    return await Promise.all(rawGallery.map(async (art: any) => {
      const key = art.key || art.url; // Support legacy 'url' field if it was actually a key
      const url = await signUrl(key);
      return { ...art, url, key };
    }));
  } catch {
    return [];
  }
};

export const updateGallery = async (newArtData: { id: number; title: string; category: string; key: string }) => {
  const currentGallery = await fetchGallery();
  // Strip signed URLs before saving
  const cleanGallery = currentGallery.map(({ url, ...rest }: any) => rest);
  const updatedGallery = [newArtData, ...cleanGallery];
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: MANIFEST_KEY,
    Body: JSON.stringify(updatedGallery),
    ContentType: 'application/json',
  });

  await s3Client.send(command);
  return fetchGallery();
};

export const fetchAbout = async () => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: ABOUT_KEY,
    });
    const response = await s3Client.send(command);
    const bodyContents = await response.Body?.transformToString();
    if (!bodyContents) return null;
    
    const about = JSON.parse(bodyContents);
    if (about.profilePic) {
      about.profilePicUrl = await signUrl(about.profilePic);
    }
    return about;
  } catch (error) {
    return null;
  }
};

export const updateAbout = async (aboutData: any) => {
  // Store the key, not the signed URL
  const { profilePicUrl, ...dataToSave } = aboutData;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: ABOUT_KEY,
    Body: JSON.stringify(dataToSave),
    ContentType: 'application/json',
  });

  await s3Client.send(command);
  return aboutData;
};
