export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    let message = "";
    if (authorization) {
      const decoded = await 
    }
  } catch (error) {
    next(error);
  }
};
