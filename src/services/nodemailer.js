import nodemailer from "nodemailer";

const emailProcessor = async (mailBodyObj) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail(mailBodyObj);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log(error);
  }
};

export const emailVerificationMail = ({ email, fName, url }) => {
  const obj = {
    from: `"Chautari" <${process.env.SMTP_EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "Action Required", // Subject line
    text: `hello there, pelase follow the link to verify you account ${url}`, // plain text body
    html: `
    Hello ${fName},
<br />
<br />

<p>
    Click the button bellow to verify your email
   </p> 

   <br />
   <a href="${url}" style="padding: 2rem; background: green"> Verify Now
   </a>


<p>
If the button doesn't work above, Please copy the following url and paste in your browser
${url}
</p>
<br />
<br />
<p>
Regards, <br />
Chautari
</p>


    `,
  };

  emailProcessor(obj);
};

// send OTP for password reset
export const sendOtpMail = ({ email, fName, token }) => {
  const obj = {
    from: `"Chautari" <${process.env.SMTP_EMAIL}>`, // sender
    to: email, // list of receivers
    subject: "OTP for Password Reset", // Subject line
    text: `hello there, please find the OTP to reset your password ${token}`, // plain text body
    html: `
    Hello ${fName},
<br />
<br />

<p>
    Click the button bellow to verify your email
   </p> 

   <br />
   <div  style="font-size: 2rem; font-weight:bolder; background: green"> ${token}
   </div>


<p>
If you didn't request your otp to reset your password, please don't share it
</p>
<br />
<br />
<p>
Regards, <br />
Chautari
</p>


    `,
  };
  emailProcessor(obj);
};

// send account update change
export const accountUpdatedNotification = ({ email, fName }) => {
  const obj = {
    from: `"Chautari" <${process.env.SMTP_EMAIL}>`, // sender
    to: email, // list of receivers
    subject: "Your account has been updated", // Subject line
    text: `hello there, somebody just updated your account, if that's not you, change your password and contact admin`, // plain text body
    html: `
    Hello ${fName},
<br />
<br />



   <br />
   <div  style="font-size: 2rem; font-weight:bolder; background: green"> somebody just updated your account, if that's not you, change your password and contact admin
   </div>

<br />
<br />
<p>
Regards, <br />
Chautari
</p>


    `,
  };
  emailProcessor(obj);
};
