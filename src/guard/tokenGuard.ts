import { NextFunction, Request, Response } from "express";
import { HttpError } from "../HttpError.js";
import 'dotenv/config'

if (!process.env.ACCESS_TOKEN) {
  throw new Error('ACCESS_TOKEN not defined')
}

export function tokenGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.query.token

  if (token !== process.env.ACCESS_TOKEN) {
    throw new HttpError('Invalid token', 401)
  }

  next()
}