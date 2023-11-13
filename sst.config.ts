import { SSTConfig } from "sst";
import { StorageStack } from "./stacks/StorageStack";
import { ApiStack } from "./stacks/ApiStack";

export default {
  config(_input) {
    return {
      name: "otp-system-serverless",
      region: "ap-south-1",
      profile: "cb",
    };
  },
  stacks(app) {
    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy("destroy");
    }

    app.stack(StorageStack);
    app.stack(ApiStack);
  },
} satisfies SSTConfig;
