import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table } from "sst/node/table";
import { v4 as uuidv4 } from "uuid";

const OTP_EXPIRY_IN_MINUTES = 10;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (event.body) {
    const body = JSON.parse(event.body);
    const { email } = body;
    const sessionId = uuidv4();
    const otp = generateOtp(Number(process.env.OTP_LENGTH));

    const input = {
      Item: {
        pk: `${sessionId}#${otp}`,
        expireAt:
          Math.floor(new Date().getTime() / 1000) + OTP_EXPIRY_IN_MINUTES * 60,
        email: email,
      },
      TableName: Table.Otp.tableName,
    };

    const command = new PutCommand(input);
    const response = await docClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId, response }),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: true }),
    };
  }
};

const generateOtp = (length: number) => {
  var result = "";
  const characters = "0123456789";
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  console.log(`Length: ${length} , Generated OTP: ${result}`);
  return result;
};
