import express from "express";
import {
  getAUser,
  getUserById,
  insertUser,
  updateUser,
  updateUserById,
} from "../models/user/userModel.js";
import {
  newUserValidation,
  updateUserValidation,
} from "../middlewares/joiValidation.js";
import { v4 as uuidv4 } from "uuid";
import {
  deleteManySession,
  deleteSession,
  insertSession,
} from "../models/session/sessionModel.js";
import {
  accountUpdatedNotification,
  emailVerificationMail,
  sendOtpMail,
} from "../services/nodemailer.js";
import { auth, jwtAuth } from "../middlewares/auth.js";
import { getTokens, signAccessJWT } from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { otpGenerator } from "../utils/otp.js";

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

// login user
router.post("/login", async (req, res, next) => {
  try {
    let message = "";
    const { email, password } = req.body;
    // 1. check if user exist with email
    const user = await getAUser({ email });

    if (user?._id && user?.status === "active" && user?.isEmailVerified) {
      //verify passwords

      const confirmPass = comparePassword(password, user.password);

      if (confirmPass) {
        //user is now authenticated

        // create jwts then return

        return res.json({
          status: "success",
          message: "Login Successful",
          jwts: await getTokens(email),
        });
      }
    }

    if (user?.status === "inactive") {
      message = "Your account is not active, contact admin";
    }

    if (!user?.isEmailVerified) {
      message = "User not verified, please check your email and verify";
    }

    res.json({
      status: "error",
      message: message || "Invalid login details",
    });
  } catch (error) {
    next(error);
  }
});

// return access jwt
router.get("/new-accessjwt", jwtAuth, async (req, res, next) => {
  try {
    const { email } = req.userInfo;
    const accessJWT = await signAccessJWT(email);
    if (accessJWT) {
      return res.json({
        status: "success",
        message: "",
        accessJWT,
      });
    }
  } catch (error) {
    next(error);
  }
});

// logout user
router.delete("/logout", auth, async (req, res, next) => {
  try {
    const { email } = req.userInfo;

    await updateUser(
      {
        email,
      },
      { refreshJWT: "" }
    );

    await deleteManySession({ associate: email });

    res.json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Password reset
// router.post("/otp", async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const user = await getAUser({ email });
//     if (user?._id) {
//       const token = otpGenerator();

//       const session = await insertSession({
//         token,
//         associate: email,
//         type: "otp",
//       });
//       session?._id && sendOtpMail({ token, fName: user.fName, email });
//     }

//     res.json({
//       status: "success",
//       message:
//         "If your email exists in our system, please check your email for OTP",
//     });
//   } catch (error) {
//     next(error);
//   }
// });

router.patch("/password/reset", async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if ((email, otp, password)) {
      const session = await deleteSession({
        token: otp,
        associate: email,
        type: "otp",
      });
      if (session?._id) {
        //update user table with new hashPass
        const user = await updateUser(
          { email },
          { password: hashPassword(password) }
        );
        if (user?._id) {
          accountUpdatedNotification({ email, fName: user.fName });
          res.json({
            status: "success",
            message: "Your password has been reset successfully",
          });
        }
      }
    }

    res.json({
      status: "error",
      message: "Invalid data, please try again later",
    });
  } catch (error) {
    next(error);
  }
});

// Update User Details
router.put("/:_id", updateUserValidation, async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { password, email, ...rest } = req.body;
    const user = await getAUser({ email });
    if (user?._id === _id) {
      const confirmPass = comparePassword(password, user.password);
      if (confirmPass) {
        const updatedUser = await updateUserById(_id, req.body);
        if (updatedUser?._id) {
          return res.json({
            status: "success",
            message: "Login Successful",
            data: updatedUser,
          });
        }
      } else {
        return res.json({
          status: "error",
          message: "Invalid Password",
        });
      }
    } else {
      return res.json({
        status: "error",
        message: "Invalid User",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Update User Password
router.put("/:_id/password", async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { oldPassword, password } = req.body;
    const user = await getUserById(_id);
    if (user?._id) {
      const confirmPass = comparePassword(oldPassword, user.password);
      if (confirmPass) {
        password = hashPassword(password);
        const updatedUser = await updateUserById(_id, { password });
        if (updatedUser?._id) {
          return res.json({
            status: "success",
            message: "Password Updated Successfully",
          });
        }
      } else {
        return res.json({
          status: "error",
          message: "Invalid Password",
        });
      }
    } else {
      return res.json({
        status: "error",
        message: "Invalid User",
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
