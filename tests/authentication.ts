import { TrustedShops } from "../src/TrustedShops";

async function main() {
  const clientId = "someclientID";
  const clientSecret = "somesecret";

  await TrustedShops.authenticate(clientId, clientSecret);
}

main();
