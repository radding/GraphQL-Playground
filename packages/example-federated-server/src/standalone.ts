import { startStandaloneServer } from "@apollo/server/standalone";
import { server } from ".";

const { url } = await startStandaloneServer(server);
console.log(`🚀  Server ready at ${url}`);