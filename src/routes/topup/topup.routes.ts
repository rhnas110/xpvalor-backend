import { Router } from "express";
import {
  createTransaction,
  getTransaction,
  getTransactionById,
  uploadPayment,
} from "../../controllers/topup";
import { accessValidation } from "../../middlewares/accessValidation";
import { uploadPaymentPicture } from "../../helpers/multer";

export const router = Router();

router.post("/topup", accessValidation, createTransaction);
router.get("/topup/:id", accessValidation, getTransactionById);
router.patch(
  "/topup/upload_payment/:id",
  accessValidation,
  uploadPaymentPicture.single("picture"),
  uploadPayment
);
router.get("/topup", accessValidation, getTransaction);
