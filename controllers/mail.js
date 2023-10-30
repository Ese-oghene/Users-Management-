import nodemailer from 'nodemailer'
import ENV from '../config.js'
import dotenv from 'dotenv';
dotenv.config();
// require('dotenv').config();

const transporter = nodemailer.createTransport({
  //host:'smtp.ethereal.email',
    host: '',
    port: 465,
    secure: true,
    auth: {
      user: '',
      pass: '', 
      type: 'PLAIN',
    },
  });
  
// const transporter = nodemailer.createTransport({
// host:'smtp.ethereal.email',
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: 'lowell.boehm66@gmail.com',
//     pass: 'GbdypyXsuy7HXqscBm', 
//   },
// });


/** POST: http://localhost:8000/api/egisterMail
 * @param : {
  "username" : "example123",
  "userEmail" : "admin123"
 "text" : ""
  "subject" : ""
  }*/

export const registerMail = async (req,res)  =>{

  const {username, userEmail, text, subject} = req.body


  try {
    // Send email
    const info = await transporter.sendMail({
      from: 'support@connecthub.com.ng',
      to: userEmail,
      subject: subject || "Sign up successfully",
      text: `Dear ${username},\n\n, You have been invited to collaborate on a project  \nsee \nDetails: below`,
    });

    console.log('Email sent successfully:', info.response);

    res.status(200).json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error('Error sending email:', error);

    res.status(500).json({ error: 'Error sending email' });
  }

}