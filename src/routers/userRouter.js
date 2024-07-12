import express from "express";
import { insertUser } from "../models/user/userModel.js";
import { newUserValidation } from "../middlewares/joiValidation.js";

const router = express.Router();

router.post("/", newUserValidation, async (req, res, next) => {
  try {
    req.body.password = hashPassword(req.body.password);
    const user = await insertUser(req.body);
  } catch (error) {}
});

export default router;
