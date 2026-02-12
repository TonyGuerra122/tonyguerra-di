import { Constructor, Lifetime, Provider, Resolver, Token } from "./tokens.js";
export declare class Container implements Resolver {
    private readonly providers;
    private readonly singletons;
    private readonly resolvingStack;
    constructor();
    register<T>(token: Token<T>, provider: Provider<T>): this;
    bind<T>(clazz: Constructor<T>, lifetime?: Lifetime): this;
    resolve<T>(token: Token<T>): T;
    private createFromProvider;
    private construct;
}
//# sourceMappingURL=container.d.ts.map