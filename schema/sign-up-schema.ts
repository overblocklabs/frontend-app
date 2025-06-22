import { object, string } from "yup";

const signupSchema = object({
  publicKey: string().required(),
  contract: string().required(),
});

export default signupSchema;
