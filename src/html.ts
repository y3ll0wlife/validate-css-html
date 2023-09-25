import { ValidatorSettings, w3cHtmlValidator } from "w3c-html-validator";

interface HTMLValidation {
  errors: string[];
  warnings: string[];
}

export default async function validateHTML(
  content: string
): Promise<HTMLValidation> {
  let warnings: string[] = [];
  let errors: string[] = [];

  const options: Partial<ValidatorSettings> = {
    html: content,
    output: "json",
  };
  const result = await w3cHtmlValidator.validate(options);
  console.log(result);

  return {
    warnings,
    errors,
  };
}
