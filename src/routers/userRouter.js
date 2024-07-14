import express from "express";
import { insertUser, updateUser } from "../models/user/userModel.js";
import { newUserValidation } from "../middlewares/joiValidation.js";
import { v4 as uuidv4 } from "uuid";
import {
  deleteSession,
  insertSession,
} from "../models/session/sessionModel.js";
import { emailVerificationMail } from "../services/nodemailer.js";
import { auth } from "../middlewares/auth.js";

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

//user verification
router.post("/user-verification", async (req, res, next) => {
  try {
    const { c, e } = req.body;
    //delete session data

    const session = await deleteSession({
      token: c,
      associate: e,
    });
    if (session?._id) {
      //update user table
      const result = await updateUser(
        { email: e },
        {
          status: "active",
          isEmailVerified: true,
        }
      );
      if (result?._id) {
        // send user an email
        return res.json({
          status: "success",
          message: "Your account has been verified. You may sign in now",
        });
      }
    }

    res.json({
      status: "error",
      message: "Invalid link, contact admin",
    });
  } catch (error) {
    next(error);
  }
});

// fetching user
router.get("/", auth, async (req, res, next) => {
  try {
    const { userInfo } = req;
    userInfo.refreshJWT = undefined;
    userInfo?.status === "active"
      ? res.json({
          status: "success",
          message: "User Login successful",
          userInfo,
        })
      : res.json({
          status: "error",
          message:
            "your account has not been activated. Check your email to verify your account",
        });
  } catch (error) {
    next(error);
  }
});

export default router;
