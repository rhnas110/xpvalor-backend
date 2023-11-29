import multer from "multer";
import { extname, join } from "path";

const storagePaymentPicture = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, join(__dirname, "../public/payment"));
  },
  filename: (_, file, cb) => {
    cb(
      null,
      "XPValor" +
        "_" +
        new Date().getFullYear() +
        Math.round(Math.random() * 999999) +
        "." +
        file.mimetype.split("/")[1]
    );
  },
});

const uploadPaymentPicture = multer({
  storage: storagePaymentPicture,
  limits: { fileSize: 1024000 },
  fileFilter(_, file, cb) {
    const passEXT = [".jpg", ".jpeg", ".png"];
    const extPicture = extname(file.originalname).toLowerCase();

    if (!passEXT.includes(extPicture)) {
      const error = new Error("Please upload image file (jpg, jpeg, png)");
      return cb(error);
    }
    cb(null, true);
  },
});

export { uploadPaymentPicture };
