import { StartingPosition } from "aws-cdk-lib/aws-lambda";
import { StackContext, Table } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
  const table = new Table(stack, "Otp", {
    fields: {
      pk: "string",
      expireAt: "number",
      email: "string",
    },
    primaryIndex: {
      partitionKey: "pk",
    },
    stream: "new_image",
    timeToLiveAttribute: "expireAt",
    consumers: {
      sendEmail: {
        function: {
          functionName: "sendEmail",
          handler: "packages/functions/src/sendEmail.handler",
          timeout: 10,
          environment: {
            FROM_ADDRESS: "updates@durgadas.in",
          },
          permissions: ["ses"],
        },
        filters: [
          {
            eventName: ["INSERT"],
          },
        ],
        cdk: {
          eventSource: {
            startingPosition: StartingPosition.TRIM_HORIZON,
            batchSize: 100,
          },
        },
      },
    },
  });

  stack.addOutputs({
    TableName: table.tableName,
    TableArn: table.tableArn,
  });

  return {
    table,
  };
}
