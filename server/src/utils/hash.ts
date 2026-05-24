import argon2 from "argon2";
import crypto from "crypto";

export const hashValue = (value: string) => argon2.hash(value);
export const verifyHash = (hash: string, value: string) =>
  argon2.verify(hash, value);

export const createRandomToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");
