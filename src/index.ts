import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { topupRouter } from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// TEST API
app.get("/api", (_, res) => {
  res.json({
    status: true,
    success: true,
    message: "HERE XPVALOR API",
  });
});

app.use("/api", topupRouter);

// not found api
app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).json({ success: false, error: "Not Found" });
  } else {
    next();
  }
});
// end of not found api

// error api
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.path.includes("/api/")) {
    res.status(500).json({ success: false, error: "Error Server" });
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server running in PORT: ${PORT}`);
});
