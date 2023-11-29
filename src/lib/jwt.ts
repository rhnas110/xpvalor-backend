import jwt from "jsonwebtoken";

const jwt_key = process.env.SIPALINGSECRET!;

const validateToken = (token: string) => jwt.verify(token, jwt_key);

export { validateToken };
