export declare class DiError extends Error {
}
export declare class ProviderNotFoundError extends DiError {
    constructor(token: unknown);
}
export declare class CircularDependencyError extends DiError {
    constructor(stack: unknown[]);
}
//# sourceMappingURL=errors.d.ts.map