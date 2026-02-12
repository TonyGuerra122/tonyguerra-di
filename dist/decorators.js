import "reflect-metadata";
const INJECT_TOKENS_KEY = Symbol("di:inject_tokens");
const INJECTABLE_KEY = Symbol("di:injectable");
export function Injectable() {
    return (target) => {
        Reflect.defineMetadata(INJECTABLE_KEY, true, target);
    };
}
export function Inject(token) {
    return (target, _propertyKey, parameterIndex) => {
        const metaTarget = (typeof target === "function" ? target : target.constructor);
        const existing = (Reflect.getMetadata(INJECT_TOKENS_KEY, metaTarget) ?? []);
        existing[parameterIndex] = token;
        Reflect.defineMetadata(INJECT_TOKENS_KEY, existing, metaTarget);
    };
}
export function isInjectable(target) {
    return isMetadataTarget(target) && Reflect.getMetadata(INJECTABLE_KEY, target) === true;
}
export function getInjectTokens(target) {
    if (!isMetadataTarget(target))
        return [];
    return (Reflect.getMetadata(INJECT_TOKENS_KEY, target) ?? []);
}
function isMetadataTarget(v) {
    return (typeof v === "object" && v !== null) || typeof v === "function";
}
//# sourceMappingURL=decorators.js.map