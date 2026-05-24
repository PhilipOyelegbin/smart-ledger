import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { BadRequestError } from "../utils/AppError";

export const validate = (
  schema: Joi.ObjectSchema,
  property: "body" | "query" | "params" = "body",
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return next(
        new BadRequestError(
          error.details.map((detail) => detail.message).join(", "),
        ),
      );
    }

    req[property] = value;
    next();
  };
};
