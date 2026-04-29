import { execa } from "execa";

export async function runCommand(command: string, args: string[], cwd: string) {
  return execa(command, args, {
    cwd,
    stdio: "inherit",
    preferLocal: true
  });
}
