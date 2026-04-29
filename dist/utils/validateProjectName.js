import validatePackageName from "validate-npm-package-name";
export function validateProjectName(input) {
    const projectName = input.trim();
    if (!projectName) {
        return "Project name is required.";
    }
    const result = validatePackageName(projectName);
    if (result.validForNewPackages) {
        return true;
    }
    const errors = [...(result.errors ?? []), ...(result.warnings ?? [])];
    return errors[0] ?? "Please enter a valid npm package name.";
}
//# sourceMappingURL=validateProjectName.js.map