export const NAME_MAX_LENGTH = 50;

export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_MIN_LENGTH = 3;

export const PASSWORD_SALT_ROUNDS = 10;
export const passwordMinLength = process.env.USER_PASSWORD_MIN_LENGTH
  ? parseInt(process.env.USER_PASSWORD_MIN_LENGTH)
  : 6;
export const passwordMaxLength = process.env.USER_PASSWORD_MAX_LENGTH
  ? parseInt(process.env.USER_PASSWORD_MAX_LENGTH)
  : 20;

export const BIO_MAX_LENGTH = 200;
export const IMAGE_MAX_LENGTH = 200;