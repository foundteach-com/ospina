export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'DO_NOT_USE_THIS_SECRET_IN_PRODUCTION_OR_I_WILL_CRY',
  expiresIn: '1d',
};
