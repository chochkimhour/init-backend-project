import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function getPackageRoot() {
    return path.resolve(__dirname, "..");
}
export function getTemplateDirectory(framework, language) {
    const templateLanguage = framework === "nestjs" ? "typescript" : language;
    return path.join(getPackageRoot(), "templates", framework, templateLanguage);
}
export function getTemplateReplacements(options) {
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
export function applyTemplateReplacements(content, options) {
    const replacements = getTemplateReplacements(options);
    return Object.entries(replacements).reduce((result, [key, value]) => result.replaceAll(`{{${key}}}`, value), content);
}
function formatLabel(value) {
    const labels = {
        nestjs: "NestJS",
        nodejs: "Node.js",
        jwt: "JWT Auth",
        session: "Session Auth",
        none: "None",
        postgresql: "PostgreSQL",
        mysql: "MySQL",
        mongodb: "MongoDB",
        redis: "Redis",
        swagger: "Swagger / OpenAPI",
        "class-validator": "class-validator"
    };
    return labels[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}
//# sourceMappingURL=templates.js.map