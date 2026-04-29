export declare function runCommand(command: string, args: string[], cwd: string): Promise<import("execa").Result<{
    cwd: string;
    stdio: "inherit";
    preferLocal: true;
}>>;
