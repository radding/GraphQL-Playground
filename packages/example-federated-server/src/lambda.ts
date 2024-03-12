import { handlers, startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda";
import { server } from ".";

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
);