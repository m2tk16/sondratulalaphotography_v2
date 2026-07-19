import amplifyOutputs from "../../amplify_outputs.json";

type RestApiConfig = {
  endpoint: string;
  region: string;
  apiName: string;
};

export const PUBLIC_API_NAME = "api4593058b";
export const PRIVATE_LIKE_API_NAME = "apid5657c10";

const restApis = amplifyOutputs.custom?.API as
  | Record<string, RestApiConfig>
  | undefined;

const endpointFor = (name: string) => {
  const endpoint = restApis?.[name]?.endpoint;
  if (!endpoint) {
    throw new Error(`Missing Amplify REST API configuration for ${name}.`);
  }
  return endpoint.replace(/\/$/, "");
};

export const PUBLIC_API_URL = endpointFor(PUBLIC_API_NAME);
export const PRIVATE_LIKE_API_URL = endpointFor(PRIVATE_LIKE_API_NAME);
