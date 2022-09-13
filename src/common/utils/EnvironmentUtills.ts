



export function demandEnvVar(name: string): string {
    const value: string | undefined = process.env[name];
    if (value !== undefined){
        return value;
    }
    throw Error(`No environment variable found for ${name}`)
}