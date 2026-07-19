import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Amplify } from "aws-amplify";
import awsConfig from "./aws-exports";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";

const origin = window.location.origin;
awsConfig.oauth.redirectSignIn = `${origin}/`;
awsConfig.oauth.redirectSignOut = `${origin}/`;
Amplify.configure(awsConfig);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
