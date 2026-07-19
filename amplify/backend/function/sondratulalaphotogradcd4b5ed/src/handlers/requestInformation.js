const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.REGION || "us-east-1" });
const ses = new AWS.SES();

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(body),
});

const createRequestInformationHandler =
  (sesClient, environment = process.env) => async (event) => {
  const { firstName, lastName, email, subject, message } = JSON.parse(
    event.body || "{}",
  );

  if (environment.CONTACT_DELIVERY_ENABLED !== "true") {
    return response(200, {
      message: "Contact delivery is disabled in this rehearsal environment.",
      suppressed: true,
    });
  }

  const emailParams = {
    Source: "info-contact@sondratulalaphotography.com",
    Destination: {
      ToAddresses: ["sondratulalaphotography@gmail.com"],
    },
    Message: {
      Subject: {
        Data: `Contact Form Submission: ${subject}`,
      },
      Body: {
        Text: {
          Data: `
            You have a new contact form submission:

            First Name: ${firstName}
            Last Name: ${lastName}
            Email: ${email}
            Message: ${message}
          `,
        },
      },
    },
  };

  try {
    await sesClient.sendEmail(emailParams).promise();
    return response(200, { message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return response(500, { message: "Failed to send email" });
  }
};

exports.handleRequestInformation = createRequestInformationHandler(ses);
exports.createRequestInformationHandler = createRequestInformationHandler;
