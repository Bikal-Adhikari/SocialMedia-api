import Joi from "joi";

const STR_REQUIRED = Joi.string().max(100).required();
const STR = Joi.string().max(100).allow("", null);
const LONG_STR = Joi.string().max(5000).allow("", null);
const LONG_STR_REQUIRED = Joi.string().max(5000).required();
const PHONE = Joi.number().allow("", null);
const NUM_REQ = Joi.number().required();
const EMAIL = Joi.string()
  .email({
    minDomainSegments: 2,
  })
  .allow("", null);
const EMAIL_REQ = Joi.string()
  .email({
    minDomainSegments: 2,
  })
  .required();
const DATE_REQ = Joi.date();

const joiValidator = ({ req, res, next, schema }) => {
  try {
    const { error } = schema.validate(req.body);
    error
      ? res.json({
          status: "error",
          message: error.message,
        })
      : next();
  } catch (error) {
    next(error);
  }
};

// Post Schema Validation
const mediaSchema = Joi.object({
  type: Joi.string().valid("image", "video").required(),
  urls: Joi.array().items(Joi.string().uri()).min(1).required(),
});

const reactionSchema = Joi.object({
  userId: Joi.string().required(),
  reactionType: Joi.string().valid("like", "love", "wow", "haha", "sad", "angry").required(),
  createdAt: DATE_REQ.default(Date.now),
});

const commentSchema = Joi.object({
  userId: Joi.string().required(),
  text: LONG_STR_REQUIRED,
  createdAt: DATE_REQ.default(Date.now),
});

const postValidationSchema = Joi.object({
  status: Joi.string().default("inactive"),
  userId: Joi.string().required(),
  postType: Joi.string().valid("post", "ad").required(),
  media: mediaSchema.required(),
  description: LONG_STR_REQUIRED,
  location: STR,
  reactions: Joi.array().items(reactionSchema),
  comments: Joi.array().items(commentSchema),
});

export const validatePost = (req, res, next) => {
  return joiValidator({ req, res, next, schema: postValidationSchema });
};

// Session Schema Validation
const sessionValidationSchema = Joi.object({
  token: STR_REQUIRED,
  associate: STR,
  type: STR,
});

export const validateSession = (req, res, next) => {
  return joiValidator({ req, res, next, schema: sessionValidationSchema });
};

// User Schema Validation
const userValidationSchema = Joi.object({
  status: Joi.string().default("inactive"),
  role: Joi.string().default("user"),
  fName: STR_REQUIRED,
  lName: STR_REQUIRED,
  phone: PHONE, // Optional phone number with pattern validation
  gender: STR_REQUIRED,
  email: EMAIL_REQ,
  password: STR_REQUIRED.min(8), // Minimum 8 characters for password
  refreshJWT: STR.allow(""),
  isEmailVerified: Joi.boolean().default(false),
});

export const newUserValidation = (req, res, next) => {
  return joiValidator({ req, res, next, schema: userValidationSchema });
};

export const updateUserValidation = (req, res, next) => {
  const schema = Joi.object({
    fName: STR_REQUIRED,
    lName: STR_REQUIRED,
    gender: STR_REQUIRED,
    phone: PHONE,
    password: STR_REQUIRED,
  });
  return joiValidator({ req, res, next, schema });
};

