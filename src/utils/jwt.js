import jwt from "jsonwebtoken";
import { insertSession } from "../models/session/sessionModel.js";
import { updateUser } from "../models/user/userModel.js";

export const signAccessJWT = async (email) => {
  const token = jwt.sign({ email }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "1m",
  });

  const session = await insertSession({
    token,
    associate: email,
    type: "accessJWT",
  });
  return session._id ? token : null;
};

export const verifyAccessJWT = async (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_JWT_SECRET);
  } catch (error) {
    return error.message;
  }
};

export const signRefreshJWT = async (email) => {
  const refreshJWT = jwt.sign({ email }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "30d",
    type: "refreshJWT",
  });

  const user = await updateUser({ email }, { refreshJWT });

  return user._id ? refreshJWT : null;
};

export const verifyRefreshJWT = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    return decoded;
  } catch (error) {
    return error.message;
  }
};

export const getTokens = async (email) => {
  return {
    accessJWT: await signAccessJWT(email),
    refreshJWT: await signRefreshJWT(email),
  };
};
