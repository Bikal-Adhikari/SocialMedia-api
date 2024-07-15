export const otpGenerator = (length = 6) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.round(Math.random() * 10);
  }
  return otp;
};
