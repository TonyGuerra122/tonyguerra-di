export type Constructor<T> = new (...args: any[]) => T;
export type Token<T> = symbol | string | Constructor<T>;
export interface Resolver {
    resolve<T>(token: Token<T>): T;
}
export declare enum Lifetime {
    Singleton = "singleton",
    Transient = "transient"
}
export type ClassProvider<T> = {
    useClass: Constructor<T>;
    lifetime?: Lifetime;
};
export type ValueProvider<T> = {
    useValue: T;
};
export type FactoryProvider<T> = {
    useFactory: (c: Resolver) => T;
    lifetime?: Lifetime;
};
export type Provider<T> = ClassProvider<T> | ValueProvider<T> | FactoryProvider<T>;
//# sourceMappingURL=tokens.d.ts.map