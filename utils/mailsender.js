import nodemailer from 'nodemailer';

export const sendEmail = async (recipientEmail) => {
    try {
        // Step 1: Create a transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Step 2: Define the email content
        const mailOptions = {
            from: process.env.EMAIL,
            to: recipientEmail, // recipient's email passed as an argument
            subject: 'Sending Email using Node.js',
            text: 'This is a test email sent from Node.js using Nodemailer.',
        };

        // Step 3: Send the email using the transporter
        const sent = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', sent);
        return sent;
    } catch (error) {
        console.error('Error while sending email:', error);
        throw new Error('Failed to send email'); // Re-throw the error for higher-level handling
    }
};


export default sendEmail;