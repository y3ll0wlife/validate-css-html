import { HtmlValidate } from "html-validate/node";

interface HTMLValidation {
  errors: string[];
  warnings: string[];
}

export default async function validateHTML(
  content: string
): Promise<HTMLValidation> {
  let warnings = [];
  let errors = [];

  const htmlvalidate = new HtmlValidate();
  const report = await htmlvalidate.validateString(content);

  console.log(report);

  return {
    warnings,
    errors,
  };
}
