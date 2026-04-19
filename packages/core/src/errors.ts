export class CircularReferenceError extends Error {
  public readonly cycle: string[];

  constructor(cycle: string[]) {
    super(`Circular reference detected: ${cycle.join(" → ")}`);
    this.name = "CircularReferenceError";
    this.cycle = cycle;
  }
}

export class UnresolvedRefError extends Error {
  public readonly refPath: string;
  public readonly location: string;

  constructor(refPath: string, location: string) {
    super(`Unresolved ref "${refPath}" in ${location}`);
    this.name = "UnresolvedRefError";
    this.refPath = refPath;
    this.location = location;
  }
}

export class TokenValidationError extends Error {
  public readonly errors: ValidationIssue[];

  constructor(errors: ValidationIssue[]) {
    const msg = errors.map((e) => `  - ${e.message}`).join("\n");
    super(`Token validation failed:\n${msg}`);
    this.name = "TokenValidationError";
    this.errors = errors;
  }
}

export interface ValidationIssue {
  path: string;
  message: string;
}
