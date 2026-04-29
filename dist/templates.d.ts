import type { Framework, Language, ProjectOptions } from "./types.js";
export declare function getPackageRoot(): string;
export declare function getTemplateDirectory(framework: Framework, language: Language): string;
export declare function getTemplateReplacements(options: ProjectOptions): {
    PROJECT_NAME: string;
    FRAMEWORK: string;
    LANGUAGE: string;
    DATABASE: string;
    ORM: string;
    AUTH_TYPE: string;
    API_DOCS: string;
    VALIDATION: string;
    TESTING: string;
    PACKAGE_MANAGER: import("./types.js").PackageManager;
};
export declare function applyTemplateReplacements(content: string, options: ProjectOptions): string;
