import { getSession } from "../models/session/sessionModel.js";
import { getAUser } from "../models/user/userModel.js";
import { verifyAccessJWT, verifyRefreshJWT } from "../utils/jwt.js";

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    let message = "";
    if (authorization) {
      const decoded = await verifyAccessJWT(authorization);
      if (decoded === "jwt expired") message = "jwt expired";
      if (decoded?.email) {
        const session = await getSession({
          token: authorization,
          associate: decoded.email,
        });
        if (session?._id) {
          const user = await getAUser({ email: decoded.email });

          if (user?._id && user?.isEmailVerified && user?.status === "active") {
            user.password = undefined;
            user.__v = undefined;
            req.userInfo = user;
            return next();
          }

          if (user?.status === "inactive") {
            message = "Your account is not active, contact admin";
          }

          if (!user?.isEmailVerified) {
            message = "User not verified, please check your email and verify";
          }
        }
      }
    }
    const statusCode = message === "jwt expired" ? 403 : 401;
    res.status(statusCode).json({
      status: "error",
      message: message || "unauthorized",
    });
  } catch (error) {
    next(error);
  }
};

export const jwtAuth = async (req, res, next) => {
  try {
    //     1. receive jwt via authorization header
    const { authorization } = req.headers;

    // 2. verify if jwt is valid(no expired, secretkey) by decoding jwt
    const decoded = verifyRefreshJWT(authorization);

    if (decoded?.email) {
      // 3. Check if the token exist in the DB, session table

      const user = await getAUser({
        email: decoded.email,
        refreshJWT: authorization,
      });
      if (user?._id && user.refreshJWT === authorization) {
        // 6. If user exist, they are now authorized

        user.password = undefined;
        user.__v = undefined;
        req.userInfo = user;

        return next();
      }
    }

    const error = {
      message: decoded,
      status: 403,
    };
    next(error);
  } catch (error) {
    next(error);
  }
};
