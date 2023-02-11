import { ErrorRequestHandler } from "express";
import { ValidationError } from "yup";
import { HttpError } from "./HttpError.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _) => {
  if (err instanceof ValidationError) {
    return res.status(422).json({
      error: "Invalid request",
      validation: err.message,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message
    });
  }

  console.error(err);

  return res.status(500).json({
    error: "Something went wrong",
  });
};
