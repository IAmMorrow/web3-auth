import { withIronSessionApiRoute } from 'iron-session/next'
import { importPKCS8, SignJWT } from 'jose'
import { NextApiRequest, NextApiResponse } from 'next'
import { ironOptions, jwtConfig } from '../../src/config'
import { v5 as uuidv5 } from "uuid";
import apps from "../../src/appRegistry.json";

const UUIDNamespace = "ee5965fa-0d55-48be-9870-6f8d4df17426";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { appId } = req.query;

  if (method !== "GET") {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const {
    address
  } = req.session;

  if (!address) { // user is not auth
    return res.status(401);
  }

  if (typeof appId !== "string") {
    return res.status(400).end("appId need to be a string");
  }

  const targetApp = apps.find(app => app.id === appId);
  if (!targetApp) {
    return res.status(400).end(`unknown app ${appId}`);
  }

  const userData = {
    uuid: uuidv5(address, UUIDNamespace), // we generate an UUID using the ethereum address
  };

  const pv = await importPKCS8(jwtConfig.secret, "RS256");

  const signer = new SignJWT(userData);
  signer.setProtectedHeader({ alg: "RS256" });
  signer.setIssuer(jwtConfig.issuer); // issuing service
  signer.setExpirationTime(jwtConfig.expirationTime); // token expiration time
  signer.setIssuedAt(Date.now()); // token signature date
  signer.setAudience(targetApp.id); // which service will use the token

  const jwt = await signer.sign(pv);


  /*
      console.log("DECODED: ", decodeJwt(jwt))

      const verifyResult = await jwtVerify(jwt, pb);

      console.log("RESULT: ", verifyResult)

  */

  res.json({ jwt })
}

export default withIronSessionApiRoute(handler, ironOptions)
