import { v2 as cloudinary } from 'cloudinary';

// Upload an image to Cloudinary
export const uploadImageToCloudinary = async (req, res) => {
    const { folder, height, quality } = req.body; // Get folder, height, and quality from request body
    const file = req.file; // Get the uploaded file (assuming you're using multer)

    // Validate that a file was uploaded
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Set options for Cloudinary upload
        const options = { 
            folder: folder || 'default_folder', // Set a default folder if none is provided
            resource_type: 'auto', // Automatically determine the resource type
        };

        // Optional: set height and quality if provided
        if (height) options.height = height; 
        if (quality) options.quality = quality;

        // Upload the image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, options);

        // Respond with the upload result
        return res.status(200).json({ message: 'Image uploaded successfully', data: uploadResult });
    } catch (error) {
        console.error('Error in uploading image to Cloudinary', error);
        return res.status(500).json({ message: 'Error in uploading image to Cloudinary' });
    }
};

// Delete a resource from Cloudinary
export const deleteResourceFromCloudinary = async (req, res) => {
    const { url } = req.body; // Get the URL of the resource to delete

    // Validate that a URL was provided
    if (!url) {
        return res.status(400).json({ message: 'No URL provided' });
    }

    try {
        // Delete the resource from Cloudinary
        const result = await cloudinary.uploader.destroy(url);
        console.log(`Deleted resource with Public ID: ${url}`);
        console.log('Deleted Resource result = ', result);
        
        // Respond with success message
        return res.status(200).json({ message: 'Resource deleted successfully', result });
    } catch (error) {
        console.error(`Error deleting resource with public ID ${url}`, error);
        return res.status(500).json({ message: `Error deleting resource with public ID ${url}` });
    }
};
