
export const courseEnrollmentEmail = (courseName, name)=> {
    return `
        <h1>Course Enrollment Confirmation</h1>
        <p>Hi ${name},</p>
        <p>You have successfully enrolled in the course "${courseName}".</p>
        <p>Feel free to ask questions or reach out to us if you have any concerns.</p>
        <p>Best regards,</p>
        <p>E-Learning Platform Team</p>
    `;
}

export default courseEnrollmentEmail;