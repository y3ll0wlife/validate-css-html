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
  const report = await w3cHtmlValidator.validate(options);

  for (let msg of report.messages) {
    const message = `Line ${msg.lastLine}: ${msg.message}\n**Extracted Line**\n\`\`\`html\n${msg.extract}\`\`\``;

    if (msg.type === "error") errors.push(message);
    else warnings.push(message);
  }

  return {
    warnings,
    errors,
  };
}
