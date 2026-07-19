import awsConfig from "../aws-exports";

type RestApiConfig = {
  endpoint: string;
  name: string;
};

export const PUBLIC_API_NAME = "api4593058b";
export const PRIVATE_LIKE_API_NAME = "apid5657c10";

const restApis = (awsConfig.aws_cloud_logic_custom ?? []) as RestApiConfig[];

const endpointFor = (name: string) => {
  const endpoint = restApis.find((api) => api.name === name)?.endpoint;
  if (!endpoint) {
    throw new Error(`Missing Amplify REST API configuration for ${name}.`);
  }
  return endpoint.replace(/\/$/, "");
};

export const PUBLIC_API_URL = endpointFor(PUBLIC_API_NAME);
export const PRIVATE_LIKE_API_URL = endpointFor(PRIVATE_LIKE_API_NAME);
