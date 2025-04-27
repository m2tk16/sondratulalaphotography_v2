const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const ses = new AWS.SES();

exports.handleRequestInformation = async (event) => {
  const { firstName, lastName, email, subject, message } = JSON.parse(event.body || '{}');
  console.log(firstName, lastName, email, subject, message)

  const emailParams = {
    Source: 'info-contact@sondratulalaphotography.com',
    Destination: {
      ToAddresses: ['sondratulalaphotography@gmail.com'],
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
    await ses.sendEmail(emailParams).promise();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to send email', error }),
    };
  }
};
