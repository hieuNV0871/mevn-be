const dotenv = require("dotenv")
dotenv.config()
const nodemailer = require('nodemailer')
const {google} = require('googleapis')
const {OAuth2} = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

const {
    MAIL_SERVICE_CLIENT_ID,
    MAIL_SERVICE_CLIENT_SECRET,
    MAIL_SERVICE_REFRESH_TOKEN,
    SEND_EMAIL_ADDRESS
} = process.env

const oauth2Client = new OAuth2(
    MAIL_SERVICE_CLIENT_ID,
    MAIL_SERVICE_CLIENT_SECRET,
    OAUTH_PLAYGROUND
)
oauth2Client.setCredentials({
    refresh_token: MAIL_SERVICE_REFRESH_TOKEN
})

// send mail
const sendEmail =  async (to, url, txt) => {
    
    try {
        const accessToken = await oauth2Client.getAccessToken()

        const smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: SEND_EMAIL_ADDRESS,
                clientId: MAIL_SERVICE_CLIENT_ID,
                clientSecret: MAIL_SERVICE_CLIENT_SECRET,
                refreshToken: MAIL_SERVICE_REFRESH_TOKEN,
                accessToken
            }
        })
        const mailOptions = {
            from: SEND_EMAIL_ADDRESS,
            to: to,
            subject: "HIEUNV",
            html: `
                <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the NVH channel.</h2>
                <p>Congratulations! You're almost set to start using NVH✮SHOP.
                    Just click the button below to validate your email address.
                </p>
                
                <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
            
                <p>If the button doesn't work for any reason, you can also click on the link below:</p>
            
                <div>${url}</div>
                </div>
            `

            
        }
        const result = await smtpTransport.sendMail(mailOptions)
        return result

    } catch (error) {
        console.log(error);
    }

    
    

   


}

module.exports = sendEmail