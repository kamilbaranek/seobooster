import type { NextApiHandler } from 'next';

const handler: NextApiHandler = (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
};

export default handler;
