import mongoose from 'mongoose';

const SubSectionSchema = new mongoose.Schema({
    sectionName: {
        type: String,
        required: true,
    },
    subsection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubSection', // This should match the model name
            required: true
        }
    ]
});

// Export the model correctly
export default mongoose.model('SubSection', SubSectionSchema);
