import { getInjectTokens, isInjectable } from "./decorators.js";
import { CircularDependencyError, ProviderNotFoundError } from "./errors.js";
import { Constructor, FactoryProvider, Lifetime, Provider, Resolver, Token } from "./tokens.js";

function isConstructor<T>(v: unknown): v is Constructor<T> {
  return typeof v === "function";
}

function isValueProvider<T>(p: Provider<T>): p is { useValue: T } {
  return "useValue" in p;
}

function isFactoryProvider<T>(p: Provider<T>): p is FactoryProvider<T> {
  return "useFactory" in p;
}

function isClassProvider<T>(
  p: Provider<T>,
): p is { useClass: Constructor<T>; lifetime?: Lifetime } {
  return "useClass" in p;
}

function isToken(v: unknown): v is Token<unknown> {
  return typeof v === "string" || typeof v === "symbol" || typeof v === "function";
}

export class Container implements Resolver {
  private readonly providers: Map<Token<unknown>, Provider<unknown>>;
  private readonly singletons: Map<Token<unknown>, unknown>;
  private readonly resolvingStack: Token<unknown>[];

  constructor() {
    this.providers = new Map<Token<unknown>, Provider<unknown>>();
    this.singletons = new Map<Token<unknown>, unknown>();
    this.resolvingStack = [];
  }

  public register<T>(token: Token<T>, provider: Provider<T>): this {
    this.providers.set(token as Token<unknown>, provider as Provider<unknown>);
    return this;
  }

  public bind<T>(clazz: Constructor<T>, lifetime: Lifetime = Lifetime.Singleton): this {
    return this.register(clazz, { useClass: clazz, lifetime });
  }

  public resolve<T>(token: Token<T>): T {
    const tok = token as Token<unknown>;

    if (this.singletons.has(tok)) {
      return this.singletons.get(tok) as T;
    }

    if (this.resolvingStack.includes(tok)) {
      throw new CircularDependencyError([...this.resolvingStack, tok]);
    }

    const provider = this.providers.get(tok);

    // fallback: token is class and have @Injectable
    if (!provider) {
      if (isConstructor<T>(token) && isInjectable(token)) {
        const created = this.construct(token);
        this.singletons.set(tok, created);
        return created;
      }

      throw new ProviderNotFoundError(token);
    }

    this.resolvingStack.push(tok);
    try {
      return this.createFromProvider(token, provider as Provider<T>);
    } finally {
      this.resolvingStack.pop();
    }
  }

  private createFromProvider<T>(token: Token<T>, provider: Provider<T>): T {
    const tok = token as Token<unknown>;

    if (isValueProvider(provider)) {
      return provider.useValue;
    }

    if (isFactoryProvider(provider)) {
      const lifetime = provider.lifetime ?? Lifetime.Singleton;

      if (lifetime === Lifetime.Singleton) {
        if (this.singletons.has(tok)) return this.singletons.get(tok) as T;

        const value = provider.useFactory(this);
        this.singletons.set(tok, value);
        return value;
      }

      return provider.useFactory(this);
    }

    if (isClassProvider(provider)) {
      const lifetime = provider.lifetime ?? Lifetime.Singleton;

      if (lifetime === Lifetime.Singleton) {
        if (this.singletons.has(tok)) return this.singletons.get(tok) as T;
        const instance = this.construct(provider.useClass);
        this.singletons.set(tok, instance);
        return instance;
      }

      return this.construct(provider.useClass);
    }

    // Exhausting (if you get here, types didn't match)
    throw new Error("Invalid provider");
  }

  private construct<T>(clazz: Constructor<T>): T {
    const injectTokens = getInjectTokens(clazz);
    const paramTypes = Reflect.getMetadata("design:paramtypes", clazz) ?? [];

    const args = Array.from(
      { length: Math.max(injectTokens.length, paramTypes.length) },
      (_, i) => {
        const t = injectTokens[i];
        if (isToken(t)) return this.resolve(t);

        const pt = paramTypes[i];
        if (!isToken(pt)) throw new Error("Cannot infer token");
        return this.resolve(pt);
      },
    );

    return new clazz(...args);
  }
}
