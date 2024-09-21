import Razorpay from "razorpay";
import CourseProgress from "../Models/CourseProgressSchema.js";




export const caputrePayment = async (req,res)=> {
    const {coursesID} = req.body;
    const userId = req.user.id;
    if(coursesID.length ===0){
        return res.json({
            success: false,
            message: "please provide Course Id"

        })

    }
    let totalAmount = 0;

    for(const course_id of coursesID){
        let course;
        try{
            course = await CourseProgress.findById(course_id);
            if(!course){
                return res.status(404).json({success: false, message: "could not find the course"});
            }
            totalAmount += course.price;
        }
        catch(error){
            console.log(error);
            return res.status(500).json({success: false, message: error.message});
        }

    }
    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt:Math.random(Date.now()).toString(),
    }
    try {
        const paymentResponse = await instance.instance.orders.create(options);
        return res.json({success: true, message: "payment successful", paymentResponse});

    }
    catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: error.message});
    }

}

export const verifyPayment = async (req,res)=> {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.coursesID;
    const userID = req.user.id;

    if(!razorpay_order_id || !razorpay_payment_id||!razorpay_signature ||!courses || !userID){
        return res.json({success: false, message: "Invalid request parameters"});

    }
    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        //enroll student
        await enrollStudents(courses, userID, res);
        //return res
        return res.status(200).json({ success: true, message: "Payment Verified" });
    }
    return res.status(200).json({ success: "false", message: "Payment Failed" });



}

export const enrollStudents = async(courses, userID,res)=> {
    if(!courses || !userID){
        return res.status(400).json({success: false, message: "please Provide data for Courses or UserId"});
    }
    for(const courseID of courses){
        try{
            const enrolledCourse = await courses.findOneAndUpdate({
                _id: courseID},
                {$push: {students: userID}},
                {new: true

            },)
            if(!enrolledCourse){
                return res.status(404).json({success: false, message: "Could not find the course"});
            }
            const courseProgress = await CourseProgress.create({
                courseID: courseID,
                userId: userID,
                compeletedVideos: [],

            }
                
            )
            const enrolledStudent = await UserActivation.findByIdAndUpdate(
                userID,
                {$push: {
                    courses: courseID,
                    courseProgress: courseProgress._id
                }},
                {new: true}
            )

            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Course Enrollment",
                `You have successfully enrolled in the course ${enrolledCourse.name}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
            )
        }
        catch(error){
            console.log(error);
            return res.status(500).json({success: false, message: error.message});
        }
    }


}

export const sendpaymentSuccessEmail = async (req,res)=> {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;
    if(!orderId ||!paymentId ||!amount ||!userId){
        return res.status(400).json({success: false, message: "Invalid request parameters"});
    }
    try {
        const enrolledStudent = await User.findById(userId);
        await mailsender (
            enrolledStudent.email,
            `payment Recieved`,
            paymentSuccessEmail(`${enrolledStudent.firstName}`),
            amount/ 100, orderId, paymentId

        )
    }
    catch (error){
        console.log(error);
        return res.status(500).json({success: false, message: error.message});
    }
}