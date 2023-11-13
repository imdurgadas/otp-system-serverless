import { DynamoDBStreamEvent } from "aws-lambda";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
const sesClient = new SESClient({});

export const handler = async (event: DynamoDBStreamEvent) => {
  console.log(event);

  for (const record of event.Records) {
    if (record.eventName === "INSERT" && record.dynamodb?.NewImage?.pk?.S) {
      const pk = record.dynamodb.NewImage.pk.S.split("#");
      const otp = pk[1];
      const toAddress = record.dynamodb.NewImage.email.S;

      if (toAddress) {
        const sendEmailCommand = createSendEmailCommand(toAddress, otp);
        const res = await sesClient.send(sendEmailCommand);
        console.log(`Response: ${JSON.stringify(res)}`);
      }
    }
  }
};

const createSendEmailCommand = (toAddress: string, otp: string) => {
  var htmlBody =
    `<!DOCTYPE html>
    <html>
      <body>
        <p>Use this code to verify your login </p>
        <p><h1>` +
    otp +
    `</h1></p>
      </body>
    </html>`;

  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "OTP for the ABC Corp Login",
      },
    },
    Source: process.env.FROM_ADDRESS,
    ReplyToAddresses: [],
  });
};
