export class DiError extends Error {}

export class ProviderNotFoundError extends DiError {
  constructor(token: unknown) {
    super(`No provider found for token: ${String(token)}`);
  }
}

export class CircularDependencyError extends DiError {
  constructor(stack: unknown[]) {
    super(`Circular dependency detected: ${stack.map(String).join(" -> ")}`);
  }
}
