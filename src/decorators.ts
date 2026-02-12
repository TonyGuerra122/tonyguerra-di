import "reflect-metadata";
import type { Constructor, Token } from "./tokens.js";

const INJECT_TOKENS_KEY = Symbol("di:inject_tokens");
const INJECTABLE_KEY = Symbol("di:injectable");

export function Injectable(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(INJECTABLE_KEY, true, target);
  };
}

export function Inject<T>(token: Token<T>): ParameterDecorator {
  return (target, _propertyKey, parameterIndex) => {
    const metaTarget = (typeof target === "function" ? target : target.constructor) as object;

    const existing = (Reflect.getMetadata(INJECT_TOKENS_KEY, metaTarget) ?? []) as unknown[];
    existing[parameterIndex] = token;

    Reflect.defineMetadata(INJECT_TOKENS_KEY, existing, metaTarget);
  };
}

export function isInjectable<T>(target: unknown): target is Constructor<T> {
  return isMetadataTarget(target) && Reflect.getMetadata(INJECTABLE_KEY, target) === true;
}

export function getInjectTokens(target: unknown): unknown[] {
  if (!isMetadataTarget(target)) return [];
  return (Reflect.getMetadata(INJECT_TOKENS_KEY, target) ?? []) as unknown[];
}

function isMetadataTarget(v: unknown): v is object {
  return (typeof v === "object" && v !== null) || typeof v === "function";
}
