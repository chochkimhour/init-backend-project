import { execa } from "execa";
export async function runCommand(command, args, cwd) {
    return execa(command, args, {
        cwd,
        stdio: "inherit",
        preferLocal: true
    });
}
//# sourceMappingURL=runCommand.js.map