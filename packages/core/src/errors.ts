/**
 * Thrown by `resolveRefs` when a `{ ref }` chain points back at
 * itself (directly or transitively).
 *
 * @example
 * ```ts
 * try {
 *   resolveRefs(tokens);
 * } catch (err) {
 *   if (err instanceof CircularReferenceError) {
 *     console.error("cycle:", err.cycle.join(" → "));
 *   }
 * }
 * ```
 */
export class CircularReferenceError extends Error {
    /** The chain of ref paths that form the cycle. */
    public readonly cycle: string[];

    constructor(cycle: string[]) {
        super(`Circular reference detected: ${cycle.join(" → ")}`);
        this.name = "CircularReferenceError";
        this.cycle = cycle;
    }
}

/**
 * Thrown by `resolveRefs` when a ref points at a path that does not
 * exist in the token tree (and isn't a builtin palette step).
 */
export class UnresolvedRefError extends Error {
    /** The dot-separated ref path that failed to resolve. */
    public readonly refPath: string;
    /** Token-tree location where the bad ref was encountered. */
    public readonly location: string;

    constructor(refPath: string, location: string) {
        super(`Unresolved ref "${refPath}" in ${location}`);
        this.name = "UnresolvedRefError";
        this.refPath = refPath;
        this.location = location;
    }
}

/**
 * Thrown by `loadTokens` (and directly by `validateTokens` callers)
 * when a config has structural or semantic issues. All issues are
 * aggregated into the `errors` array — inspect it for per-path detail.
 *
 * @example
 * ```ts
 * try {
 *   await loadTokens("./tokens.config.ts");
 * } catch (err) {
 *   if (err instanceof TokenValidationError) {
 *     for (const issue of err.errors) {
 *       console.error(issue.path, issue.message);
 *     }
 *   }
 * }
 * ```
 */
export class TokenValidationError extends Error {
    /** Every issue raised during validation. */
    public readonly errors: ValidationIssue[];

    constructor(errors: ValidationIssue[]) {
        const msg = errors.map((e) => `  - ${e.message}`).join("\n");
        super(`Token validation failed:\n${msg}`);
        this.name = "TokenValidationError";
        this.errors = errors;
    }
}

/**
 * One row in a {@link TokenValidationError}'s `errors` array.
 */
export interface ValidationIssue {
    /** Dot-separated path into the config tree where the issue occurred. */
    path: string;
    /** Human-readable description of what's wrong. */
    message: string;
    /**
     * How serious the issue is.
     *
     * - `"error"` (default): blocks the build; `loadTokens` throws a
     *   {@link TokenValidationError} when any error-severity issues are
     *   present.
     * - `"warning"`: surfaced via `console.warn` by `loadTokens`, but
     *   does not throw. Use for deprecated APIs the user should migrate
     *   away from.
     * - `"info"`: surfaced via `console.info` by `loadTokens`. Use for
     *   non-blocking nudges (e.g. non-canonical role names that won't
     *   reach PrimeVue's severity-aware components).
     */
    severity?: "error" | "warning" | "info";
}
