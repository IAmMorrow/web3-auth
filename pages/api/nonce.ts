import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { generateNonce } from "siwe";
import { ironOptions } from "../../src/config";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  req.session.nonce = generateNonce();
  await req.session.save();

  res.json({ nonce: req.session.nonce });
};

export default withIronSessionApiRoute(handler, ironOptions);
