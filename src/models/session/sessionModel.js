import sessionSchema from "./sessionSchema.js";

export const insertSession = (sessionObj) => {
  return sessionSchema(sessionObj).save();
};

export const getSession = (filter) => {
  return sessionSchema.findOne(filter);
};

export const deleteSession = (filter) => {
  return sessionSchema.findOneAndDelete(filter);
};
export const deleteManySession = (filter) => {
  return sessionSchema.deleteMany(filter);
};
