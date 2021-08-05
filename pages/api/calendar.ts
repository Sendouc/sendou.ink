import { NextApiRequest, NextApiResponse } from "next";
import { createHandler } from "utils/api";
import calendarService from "services/calendar";

const GET = async (_req: NextApiRequest, res: NextApiResponse) => {
  const events = await calendarService.events();
  res.status(200).json(events);
};

const colorsHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET });

export default colorsHandler;
