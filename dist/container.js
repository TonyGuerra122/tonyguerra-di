import { getInjectTokens, isInjectable } from "./decorators.js";
import { CircularDependencyError, ProviderNotFoundError } from "./errors.js";
import { Lifetime } from "./tokens.js";
function isConstructor(v) {
    return typeof v === "function";
}
function isValueProvider(p) {
    return "useValue" in p;
}
function isFactoryProvider(p) {
    return "useFactory" in p;
}
function isClassProvider(p) {
    return "useClass" in p;
}
function isToken(v) {
    return typeof v === "string" || typeof v === "symbol" || typeof v === "function";
}
export class Container {
    providers;
    singletons;
    resolvingStack;
    constructor() {
        this.providers = new Map();
        this.singletons = new Map();
        this.resolvingStack = [];
    }
    register(token, provider) {
        this.providers.set(token, provider);
        return this;
    }
    bind(clazz, lifetime = Lifetime.Singleton) {
        return this.register(clazz, { useClass: clazz, lifetime });
    }
    resolve(token) {
        const tok = token;
        if (this.singletons.has(tok)) {
            return this.singletons.get(tok);
        }
        if (this.resolvingStack.includes(tok)) {
            throw new CircularDependencyError([...this.resolvingStack, tok]);
        }
        const provider = this.providers.get(tok);
        // fallback: token is class and have @Injectable
        if (!provider) {
            if (isConstructor(token) && isInjectable(token)) {
                const created = this.construct(token);
                this.singletons.set(tok, created);
                return created;
            }
            throw new ProviderNotFoundError(token);
        }
        this.resolvingStack.push(tok);
        try {
            return this.createFromProvider(token, provider);
        }
        finally {
            this.resolvingStack.pop();
        }
    }
    createFromProvider(token, provider) {
        const tok = token;
        if (isValueProvider(provider)) {
            return provider.useValue;
        }
        if (isFactoryProvider(provider)) {
            const lifetime = provider.lifetime ?? Lifetime.Singleton;
            if (lifetime === Lifetime.Singleton) {
                if (this.singletons.has(tok))
                    return this.singletons.get(tok);
                const value = provider.useFactory(this);
                this.singletons.set(tok, value);
                return value;
            }
            return provider.useFactory(this);
        }
        if (isClassProvider(provider)) {
            const lifetime = provider.lifetime ?? Lifetime.Singleton;
            if (lifetime === Lifetime.Singleton) {
                if (this.singletons.has(tok))
                    return this.singletons.get(tok);
                const instance = this.construct(provider.useClass);
                this.singletons.set(tok, instance);
                return instance;
            }
            return this.construct(provider.useClass);
        }
        // Exhausting (if you get here, types didn't match)
        throw new Error("Invalid provider");
    }
    construct(clazz) {
        const injectTokens = getInjectTokens(clazz);
        const paramTypes = Reflect.getMetadata("design:paramtypes", clazz) ?? [];
        const args = Array.from({ length: Math.max(injectTokens.length, paramTypes.length) }, (_, i) => {
            const t = injectTokens[i];
            if (isToken(t))
                return this.resolve(t);
            const pt = paramTypes[i];
            if (!isToken(pt))
                throw new Error("Cannot infer token");
            return this.resolve(pt);
        });
        return new clazz(...args);
    }
}
//# sourceMappingURL=container.js.map