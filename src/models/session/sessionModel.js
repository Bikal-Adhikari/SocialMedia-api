import sessionSchema from "./sessionSchema.js";

export const insertSession = (sessionObj) => {
  return sessionSchema(sessionObj).save();
};

export const getSession = (filter) => {
  return SessionSchema.findOne(filter);
};

export const deleteSession = (filter) => {
  return SessionSchema.findOneAndDelete(filter);
};
export const deleteManySession = (filter) => {
  return SessionSchema.deleteMany(filter);
};
