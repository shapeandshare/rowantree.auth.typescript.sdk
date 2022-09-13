
export function demandEnvVar (name: string): string {
  const value: string | undefined = process.env[name]
  if (value !== undefined) {
    return value
  }
  throw Error(`No environment variable found for ${name}`)
}

export function demandEnvVarAsNumber (name: string): number {
  const value: number | undefined = Number(process.env[name])
  if (value !== undefined) {
    return value
  }
  throw Error(`No environment variable found for ${name}`)
}
