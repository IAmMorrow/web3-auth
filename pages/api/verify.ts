import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { ironOptions } from "../../src/config";
import { VerifyRequestParams } from "../../src/types/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { message, signature } = req.body as VerifyRequestParams;

    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({
      signature,
      domain: process.env.VERCEL_URL,
      time: new Date().toISOString(),
      nonce: req.session.nonce,
    });

    if (result.error) {
      console.error(result.error);
      return res.status(422).json({ message: `Error: ${result.error.type}` });
    }

    const address = result.data.address.toLowerCase();
    req.session.address = address;
    await req.session.save();

    return res.json({ ok: true, address });
  } catch (_error) {
    console.error("error: ", _error);
    if (_error instanceof Error) {
      return res.json({ ok: false, message: _error.message });
    }
    return res.json({ ok: false, message: "Unknown error" });
  }
};

export default withIronSessionApiRoute(handler, ironOptions);
