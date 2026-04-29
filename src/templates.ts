import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Framework, Language, ProjectOptions } from "./types.js";
import { formatLabel } from "./utils/labels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getPackageRoot() {
  return path.resolve(__dirname, "..");
}

export function getTemplateDirectory(framework: Framework, language: Language) {
  const templateLanguage = framework === "nestjs" ? "typescript" : language;
  return path.join(getPackageRoot(), "templates", framework, templateLanguage);
}

export function getTemplateReplacements(options: ProjectOptions) {
  return {
    PROJECT_NAME: options.projectName,
    FRAMEWORK: formatLabel(options.framework),
    LANGUAGE: formatLabel(options.framework === "nestjs" ? "typescript" : options.language),
    DATABASE: formatLabel(options.database),
    ORM: formatLabel(options.orm),
    AUTH_TYPE: formatLabel(options.authType),
    API_DOCS: formatLabel(options.apiDocs),
    VALIDATION: formatLabel(options.validation),
    TESTING: formatLabel(options.testing),
    PACKAGE_MANAGER: options.packageManager
  };
}

export function applyTemplateReplacements(content: string, options: ProjectOptions) {
  const replacements = getTemplateReplacements(options);
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    content
  );
}
