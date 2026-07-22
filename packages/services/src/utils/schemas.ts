import { object, string } from "yup";

const EMAIL_VERIFICATION = object({
  email: string().email("Email not valid").required(),
}).required();

const PHONE_VERIFICATION = object({
  phone: string()
    .matches(/^\+[0-9]{1,2}.*/, "Phone not valid (e.g.  +5555551234) )")
    .required(),
}).required();

const CODE_VERIFICATION = object({
  code: string().length(6).nullable(),
}).required();

const SIGN_IN_SCHEMA = object({
  email: string().email().required(),
  otp: string().optional(),
}).required();

export const schemas = {
  EMAIL_VERIFICATION,
  PHONE_VERIFICATION,
  CODE_VERIFICATION,
  SIGN_IN_SCHEMA,
};
