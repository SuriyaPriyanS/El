import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryConnect = () => {
  try {
    const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log('Cloudinary connected successfully');
  } catch (error) {
    console.error(`Error connecting to Cloudinary: ${error}`);
  }
};
