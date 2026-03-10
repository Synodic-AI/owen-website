import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = import.meta.env.VITE_AWS_BUCKET_NAME;
const MANIFEST_KEY = 'gallery.json';
const ABOUT_KEY = 'about.json';

export const uploadToS3 = async (file: File, folder: string = 'art') => {
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileName,
    Body: file,
    ContentType: file.type,
  });

  try {
    await s3Client.send(command);
    return `https://${BUCKET}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${fileName}`;
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
    return bodyContents ? JSON.parse(bodyContents) : [];
  } catch (error) {
    return [];
  }
};

export const updateGallery = async (newArt: any) => {
  const currentGallery = await fetchGallery();
  const updatedGallery = [newArt, ...currentGallery];
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: MANIFEST_KEY,
    Body: JSON.stringify(updatedGallery),
    ContentType: 'application/json',
  });

  await s3Client.send(command);
  return updatedGallery;
};

export const fetchAbout = async () => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: ABOUT_KEY,
    });
    const response = await s3Client.send(command);
    const bodyContents = await response.Body?.transformToString();
    return bodyContents ? JSON.parse(bodyContents) : null;
  } catch (error) {
    return null;
  }
};

export const updateAbout = async (aboutData: any) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: ABOUT_KEY,
    Body: JSON.stringify(aboutData),
    ContentType: 'application/json',
  });

  await s3Client.send(command);
  return aboutData;
};
