import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

const hashPassword = async (plainPassword) => {
  const password = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  return password;
};

const comparePassword = async (plainPassword, hash) => {
  const isMatch = await bcrypt.compare(plainPassword, hash);
  return isMatch;
};

export { hashPassword, comparePassword };
