import Section from "../Models/SectionSchema.js";
import SubSection from "../Models/SubSectionSchema.js";
import { uploadImageToCloudinary  } from "../utils/imageFileUploders.js"; // Assuming this is the right utility for video

// Create SubSection
export const createSubSection = async (req, res) => {
  try {
    const { title, description, sectionId } = req.body;
    const videoFile = req.files.video;

    // Validation
    if (!title || !description || !sectionId || !videoFile) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Upload video to Cloudinary
    const videoFileDetails = await uploadVideoToCloudinary(
      videoFile,
      process.env.FOLDER_NAME
    );

    if (!videoFileDetails) {
      return res
        .status(500)
        .json({ success: false, message: "Video upload failed" });
    }

    // Create SubSection
    const subSectionDetails = await SubSection.create({
      title,
      description,
      timeDuration: videoFileDetails.duration,
      videoUrl: videoFileDetails.secure_url,
    });

    // Update the corresponding Section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: subSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    res
      .status(200)
      .json({
        success: true,
        message: "Subsection created successfully",
        data: updatedSection,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update SubSection
export const updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body;

    if (!subSectionId) {
      return res
        .status(400)
        .json({ success: false, message: "Subsection id is required" });
    }

    // Find SubSection in the database
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "Subsection not found" });
    }

    // Update fields
    if (title) subSection.title = title;
    if (description) subSection.description = description;

    // Check and update video file if provided
    if (req.files && req.files.video) {
      const videoFile = req.files.video;
      const uploadDetails = await uploadVideoToCloudinary(
        videoFile,
        process.env.FOLDER_NAME
      );

      if (!uploadDetails) {
        return res
          .status(500)
          .json({ success: false, message: "Video upload failed" });
      }

      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = uploadDetails.duration;
    }

    // Save updated SubSection
    await subSection.save();

    // Get updated Section details
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Subsection updated successfully",
        data: updatedSection,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete SubSection
export const deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;

    // Remove SubSection reference from Section
    await Section.findByIdAndUpdate(sectionId, {
      $pull: { subSection: subSectionId },
    });

    // Delete SubSection
    const subSection = await SubSection.findByIdAndDelete(subSectionId);

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "Subsection not found" });
    }

    // Fetch updated Section
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Subsection deleted successfully",
        data: updatedSection,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
