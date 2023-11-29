import { NextFunction, Response } from "express";
import { validateToken } from "../lib/jwt";

const accessValidation = (req: any, res: Response, next: NextFunction) => {
  const accessToken: any =
    req.headers.authorization || req.headers.Authorization;

  if (!accessToken) {
    return res.status(401).json({
      message: "Token not found",
    });
  }

  const token = accessToken.split(" ")[1];

  try {
    const verifiedToken: any = validateToken(token);
    if (!verifiedToken)
      return res.status(401).json({ message: "Unauthorized Request" });

    const user = {
      id: verifiedToken.sub,
      email: verifiedToken.email,
    };
    req.user = user;
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  next();
};

export { accessValidation };
