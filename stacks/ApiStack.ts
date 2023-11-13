import { Api, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export function ApiStack({ stack }: StackContext) {
  const { table } = use(StorageStack);
  const OTP_LENGTH = StringParameter.valueForStringParameter(
    stack,
    "OTP_LENGTH"
  );

  stack.setDefaultFunctionProps({
    memorySize: "128 MB",
    architecture: "arm_64",
    runtime: "nodejs18.x",
    logRetention: "one_day",
    bind: [table],
  });

  const api = new Api(stack, "Api", {
    //customDomain: "api.aws.durgadas.in",
    routes: {
      "POST /otp/generate": {
        type: "function",
        function: {
          functionName: "generateOtp",

          handler: "packages/functions/src/generateOtp.handler",
          bind: [table],
          environment: {
            OTP_LENGTH: OTP_LENGTH,
          },
        },
      },
      "POST /otp/verify": {
        type: "function",
        function: {
          functionName: "verifyOtp",
          handler: "packages/functions/src/verifyOtp.handler",
        },
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    Domain: api.customDomainUrl,
  });

  return {
    api,
  };
}
