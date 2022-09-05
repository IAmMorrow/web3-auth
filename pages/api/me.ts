import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { ironOptions } from '../../src/config'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { address } = req.session;

  if (method !== "GET") {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${method} Not Allowed`)
  }

  if (!address) { // user is not auth
    return res.status(401);
  }

  return res.json({ address: req.session.address });
}

export default withIronSessionApiRoute(handler, ironOptions)
