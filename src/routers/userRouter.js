import express from "express";
import { insertUser } from "../models/user/userModel.js";
import { newUserValidation } from "../middlewares/joiValidation.js";
import { v4 as uuidv4 } from "uuid";
import { insertSession } from "../models/session/sessionModel.js";
import { emailVerificationMail } from "../services/nodemailer.js";

const router = express.Router();

router.post("/", newUserValidation, async (req, res, next) => {
  try {
    req.body.password = hashPassword(req.body.password);
    const user = await insertUser(req.body);
    if (user?._id) {
      const token = uuidv4();
      const obj = {
        token: token,
        associate: user.email,
        type: "User-verification",
      };
      const result = await insertSession(obj);

      if (result?._id) {
        emailVerificationMail({
          email: user.email,
          fName: user.fName,
          url:
            process.env.FE_ROOT_URL + `/verify-user?c=${token}&e=${user.email}`,
        });
        return res.json({
          status: "success",
          message:
            "We have send you an email with instructions to verify your  account. Please check your email/junk to verify your account",
        });
      }
    }
    res.json({
      status: "error",
      message: "Error Unable to create an account, Contact administration",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
