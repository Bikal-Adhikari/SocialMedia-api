import userSchema from "./userSchema.js";

export const insertUser = (userObj) => {
  return userSchema(userObj).save();
};

export const updateUser = (filter, obj) => {
  return userSchema.findOneAndUpdate(filter, obj);
};

export const getAUser = (filter) => {
  return userSchema.findOne(filter);
};
