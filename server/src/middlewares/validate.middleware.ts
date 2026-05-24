import Joi from "joi";
import { BadRequestError } from "../utils/AppError";
import type { HttpNextFunction } from "../types/http.types";

export const validate = (
  schema: Joi.ObjectSchema,
  property: "body" | "query" | "params" = "body",
) => {
  return (req: any, _res: any, next: HttpNextFunction) => {
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
