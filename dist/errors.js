export class DiError extends Error {
}
export class ProviderNotFoundError extends DiError {
    constructor(token) {
        super(`No provider found for token: ${String(token)}`);
    }
}
export class CircularDependencyError extends DiError {
    constructor(stack) {
        super(`Circular dependency detected: ${stack.map(String).join(" -> ")}`);
    }
}
//# sourceMappingURL=errors.js.map