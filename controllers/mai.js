import nodemailer from 'nodemailer'
import Mailgen from 'mailgen'

//import ENV from '../config.js'






let nodeConfig ={
    host: "smtp.ethereal.email",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and REPLACE-W`pass` values from <https://forwardemail.net>
      user: ENV.Email,
      pass: ENV.PASSWORD,
    },
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Mailgen",
        link: "https://mailgen.js"
    }
})

/** POST: http://localhost:8000/api/egisterMail
 * @param : {
  "username" : "example123",
  "userEmail" : "admin123"
 "text" : ""
  "subject" : ""
  }*/
export const regis = async (req,res) =>{
    const {username, userEmail, text, subject} = req.body

    // body of the email
    var email = {
        body:{
            name: username,
            intro: text || 'welcome to Bernardhub! we\ re very excited to have you on board.',
            outtro:'Need help, or have questions? Just reply to this email, we\ d love to help you.'
        }
    }
    var emailBody = MailGenerator.generate(email)

    let message = {
        from : ENV.Email,
        to: userEmail,
        subject: subject || "Sign up successfully",
        html: emailBody
    }

    // send mail
    transporter.sendMail(message)
    .then( () => {
        return res.status(200).send({msg: "You should recieve email from us"})
    })
    .catch(error => res.status(500).send({ Error}))
}