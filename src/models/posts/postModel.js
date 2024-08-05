import postSchema from "./postSchema";

export const insertPost = (postObj) => {
  return postSchema(postObj).save();
};

export const updatePost = (id, obj) => {
  return postSchema.findOneAndUpdate(id, obj);
};

export const getAPost = (_id) => {
  return postSchema.findById(_id);
};

export const getAllPost = () => {
  return postSchema.find();
};

export const deletePost = (_id) => {
  return postSchema.findByIdAndDelete(_id);
};
