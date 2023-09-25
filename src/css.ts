import cssValidator from "w3c-css-validator";

interface CSSValidation {
  errors: string[];
  warnings: string[];
}

export default async function validateCSS(
  content: string
): Promise<CSSValidation> {
  let warnings: string[] = [];
  let errors: string[] = [];

  const result = await cssValidator.validateText(content, {
    medium: "print",
    warningLevel: 3,
  });

  if (!result.valid) {
    errors.push(
      result.errors.map((x) => `Line ${x.line}: ${x.message}`).join("\n")
    );
    warnings.push(
      result.warnings
        .map((x) => `Line ${x.line} (${x.level}): ${x.message}`)
        .join("\n")
    );
  }

  return {
    warnings,
    errors,
  };
}
