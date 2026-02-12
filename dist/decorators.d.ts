import "reflect-metadata";
import type { Constructor, Token } from "./tokens.js";
export declare function Injectable(): ClassDecorator;
export declare function Inject<T>(token: Token<T>): ParameterDecorator;
export declare function isInjectable<T>(target: unknown): target is Constructor<T>;
export declare function getInjectTokens(target: unknown): unknown[];
//# sourceMappingURL=decorators.d.ts.map