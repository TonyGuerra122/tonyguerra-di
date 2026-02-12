import "reflect-metadata";
import { describe, expect, it } from "vitest";

import { Container, Injectable, Inject, Lifetime } from "../src";
import type { Token } from "../src/tokens";

describe("DI Container", () => {
  it("debug paramtypes", () => {
    @Injectable()
    class Logger {}

    @Injectable()
    class Service {
      constructor(public logger: Logger) {}
    }

    const meta = Reflect.getMetadata("design:paramtypes", Service) as unknown[];
    expect(meta?.[0]).toBe(Logger);
  });

  it("resolve class marked as @Injectable without manual register (fallback)", () => {
    @Injectable()
    class A {
      value = 123;
    }

    const c = new Container();
    const a = c.resolve(A);

    expect(a.value).toBe(123);
  });

  it("singleton lifetime returns same instance", () => {
    @Injectable()
    class A {}

    const c = new Container();
    c.bind(A, Lifetime.Singleton);

    const a1 = c.resolve(A);
    const a2 = c.resolve(A);

    expect(a1).toBe(a2);
  });

  it("transient lifetime returns different instances", () => {
    @Injectable()
    class A {}

    const c = new Container();
    c.bind(A, Lifetime.Transient);

    const a1 = c.resolve(A);
    const a2 = c.resolve(A);

    expect(a1).not.toBe(a2);
  });

  it("injects dependencies by reflected constructor types", () => {
    @Injectable()
    class Logger {
      log(msg: string) {
        return msg;
      }
    }

    @Injectable()
    class Service {
      constructor(public logger: Logger) {}
    }

    const c = new Container();
    const s = c.resolve(Service);

    expect(s.logger).toBeInstanceOf(Logger);
    expect(s.logger.log("ok")).toBe("ok");
  });

  it("injects by token using @Inject()", () => {
    const CONFIG: Token<{ env: string }> = Symbol("CONFIG");

    @Injectable()
    class Service {
      constructor(@Inject(CONFIG) public cfg: { env: string }) {}
    }

    const c = new Container();
    c.register(CONFIG, { useValue: { env: "test" } });

    const s = c.resolve(Service);
    expect(s.cfg.env).toBe("test");
  });

  it("supports factory providers (singleton by default)", () => {
    const NOW = Symbol("NOW");
    let i = 0;

    const c = new Container();
    c.register(NOW, { useFactory: () => ++i });

    const n1 = c.resolve(NOW);
    const n2 = c.resolve(NOW);

    expect(n1).toBe(n2);
  });

  it("factory transient returns different values", () => {
    const NOW = Symbol("NOW");
    let i = 0;

    const c = new Container();
    c.register(NOW, { useFactory: () => ++i, lifetime: Lifetime.Transient });

    const n1 = c.resolve(NOW);
    const n2 = c.resolve(NOW);

    expect(n1).not.toBe(n2);
  });

  it("throws on circular dependencies", () => {
    const AToken = Symbol("A");
    const BToken = Symbol("B");

    @Injectable()
    class A {
      constructor(@Inject(BToken) public b: unknown) {}
    }

    @Injectable()
    class B {
      constructor(@Inject(AToken) public a: unknown) {}
    }

    const c = new Container();
    c.register(AToken, { useClass: A });
    c.register(BToken, { useClass: B });

    expect(() => c.resolve(AToken)).toThrow(/Circular dependency/i);
  });
});
