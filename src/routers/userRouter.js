import express from "express";
import { insertUser } from "../models/user/userModel.js";
import { newUserValidation } from "../middlewares/joiValidation.js";
import { v4 as uuidv4 } from "uuid";

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
    }
  } catch (error) {}
});

export default router;
