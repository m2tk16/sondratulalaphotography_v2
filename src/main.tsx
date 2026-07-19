import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Amplify } from "aws-amplify";
import type { ResourcesConfig } from "aws-amplify";
import amplifyOutputs from "../amplify_outputs.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";

const origin = window.location.origin;
const awsConfig = {
  ...amplifyOutputs,
  auth: {
    ...amplifyOutputs.auth,
    oauth: {
      ...amplifyOutputs.auth.oauth,
      redirect_sign_in_uri: [`${origin}/`],
      redirect_sign_out_uri: [`${origin}/`],
    },
  },
} as ResourcesConfig;
Amplify.configure(awsConfig);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
