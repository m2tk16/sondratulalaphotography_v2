import test from "node:test";
import assert from "node:assert/strict";
import { createRequestInformationHandler } from "./requestInformation.js";

test("suppresses contact delivery outside the production environment", async () => {
  let sendCount = 0;
  const ses = {
    sendEmail: () => {
      sendCount += 1;
      return { promise: async () => ({}) };
    },
  };
  const handler = createRequestInformationHandler(ses, {
    CONTACT_DELIVERY_ENABLED: "false",
  });

  const result = await handler({
    body: JSON.stringify({
      firstName: "Migration",
      lastName: "Test",
      email: "test@example.com",
      subject: "Suppressed",
      message: "No email should be sent.",
    }),
  });

  assert.equal(result.statusCode, 200);
  assert.equal(sendCount, 0);
  assert.equal(JSON.parse(result.body).suppressed, true);
});

test("sends contact delivery only when explicitly enabled", async () => {
  let sentParams;
  const ses = {
    sendEmail: (params) => {
      sentParams = params;
      return { promise: async () => ({}) };
    },
  };
  const handler = createRequestInformationHandler(ses, {
    CONTACT_DELIVERY_ENABLED: "true",
  });

  const result = await handler({
    body: JSON.stringify({
      firstName: "Production",
      lastName: "Test",
      email: "test@example.com",
      subject: "Enabled",
      message: "Delivery should be attempted.",
    }),
  });

  assert.equal(result.statusCode, 200);
  assert.equal(
    sentParams.Destination.ToAddresses[0],
    "sondratulalaphotography@gmail.com",
  );
});
