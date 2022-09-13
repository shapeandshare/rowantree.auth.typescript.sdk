/*
Token Claims Type
 */

export interface TokenClaims {
  sub: string
  iss: string
  exp: string

  // TODO: move to scopes
  disabled: boolean
  admin: boolean
}
