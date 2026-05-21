// const { Resend } = require('resend');

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendQuizResultEmail = async (studentEmail, studentName, topicTitle, score, totalQuestions, percentage, passed) => {
//   try {
//     await resend.emails.send({
//       from: 'Crawford University <onboarding@resend.dev>',
//       to: studentEmail,
//       subject: `CRU Onboard - Quiz Result: ${topicTitle}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
//           <div style="background: #1a3a5c; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
//             <h1 style="color: white; margin: 0;">Crawford University</h1>
//             <p style="color: #ccc; margin: 5px 0;">Online Student Orientation System</p>
//           </div>
          
//           <div style="padding: 30px;">
//             <p>Dear <strong>${studentName}</strong>,</p>
//             <p>You have completed the quiz for <strong>${topicTitle}</strong>. Here are your results:</p>
            
//             <div style="background: ${passed ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
//               <h2 style="color: ${passed ? '#27ae60' : '#e74c3c'}; margin: 0;">
//                 ${passed ? '🎉 PASSED' : '❌ FAILED'}
//               </h2>
//               <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">
//                 Score: ${score}/${totalQuestions} (${percentage}%)
//               </p>
//               <p style="margin: 0;">Pass mark: 90%</p>
//             </div>

//             ${!passed ? `
//             <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
//               <p style="margin: 0;"><strong>⚠️ Action Required:</strong> You need at least 90% to pass. 
//               Please review the topic content and retake the quiz.</p>
//             </div>
//             ` : ''}

//             <p>You can log back into the orientation system to ${passed ? 'continue with other topics' : 'review the topic and retake the quiz'}.</p>
            
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="http://localhost:5173/dashboard" 
//                 style="background: #1a3a5c; color: white; padding: 12px 30px; 
//                 border-radius: 6px; text-decoration: none; font-weight: bold;">
//                 Go to Dashboard
//               </a>
//             </div>

//             <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
//               This is an automated message from Crawford University Online Orientation System. 
//               Please do not reply to this email.
//             </p>
//           </div>
//         </div>
//       `
//     });
//     console.log(`Email sent to ${studentEmail}`);
//   } catch (error) {
//     console.error('Email error:', error.message);
//   }
// };

// module.exports = { sendQuizResultEmail };




let resendClient = null;

const getResend = async () => {
  if (!resendClient) {
    const { Resend } = await import('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const sendQuizResultEmail = async (studentEmail, studentName, topicTitle, score, totalQuestions, percentage, passed) => {
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: 'Crawford University <onboarding@resend.dev>',
      to: studentEmail,
      subject: `CRU Onboard - Quiz Result: ${topicTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="background: #1a3a5c; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Crawford University</h1>
            <p style="color: #ccc; margin: 5px 0;">Online Student Orientation System</p>
          </div>
          <div style="padding: 30px;">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>You have completed the quiz for <strong>${topicTitle}</strong>. Here are your results:</p>
            <div style="background: ${passed ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h2 style="color: ${passed ? '#27ae60' : '#e74c3c'}; margin: 0;">
                ${passed ? '🎉 PASSED' : '❌ FAILED'}
              </h2>
              <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">
                Score: ${score}/${totalQuestions} (${percentage}%)
              </p>
              <p style="margin: 0;">Pass mark: 90%</p>
            </div>
            ${!passed ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>⚠️ Action Required:</strong> You need at least 90% to pass. 
              Please review the topic content and retake the quiz.</p>
            </div>
            ` : ''}
            <p>You can log back into the orientation system to ${passed ? 'continue with other topics' : 'review the topic and retake the quiz'}.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              This is an automated message from Crawford University Online Orientation System.
            </p>
          </div>
        </div>
      `
    });
    console.log(`Email sent to ${studentEmail}`);
  } catch (error) {
    console.error('Email error:', error.message);
  }
};

module.exports = { sendQuizResultEmail };