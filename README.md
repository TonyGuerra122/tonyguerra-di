# @tonyguerradev/di

A tiny, lightweight Dependency Injection (DI) container for Node.js
built with TypeScript and decorators.

Designed to be simple, type-safe, and framework-agnostic.

------------------------------------------------------------------------

## ✨ Features

-   Decorator-based injection (`@Injectable`, `@Inject`)
-   Constructor dependency resolution
-   Automatic recursive resolution
-   Singleton and Transient lifetimes
-   Factory providers
-   Circular dependency detection
-   ESM (NodeNext) compatible
-   Fully typed

------------------------------------------------------------------------

## 📦 Installation

``` bash
npm install @tonyguerradev/di reflect-metadata
```

Make sure you import `reflect-metadata` once in your application entry
file:

``` ts
import "reflect-metadata";
```

------------------------------------------------------------------------

## 🚀 Basic Example

``` ts
import "reflect-metadata";
import { Container, Injectable, Inject, Lifetime } from "@tonyguerradev/di";

@Injectable()
class HttpService {
  get(url: string) {
    console.log("[HTTP] GET", url);
    return `response-from:${url}`;
  }
}

@Injectable()
class UserRepository {
  constructor(private http: HttpService) {}

  async getUserName(id: string) {
    return `user(${id})<-(${this.http.get(`/users/${id}`)})`;
  }
}

@Injectable()
class UserService {
  constructor(private repo: UserRepository) {}

  async run() {
    const name = await this.repo.getUserName("42");
    console.log("Loaded:", name);
  }
}

const container = new Container();

const service = container.resolve(UserService);
service.run();
```

------------------------------------------------------------------------

## 🔁 Lifetimes

### Singleton (default)

``` ts
container.register(ConfigService, {
  useClass: ConfigService,
  lifetime: Lifetime.Singleton
});
```

Same instance returned every time.

### Transient

``` ts
container.register(RequestId, {
  useFactory: () => crypto.randomUUID(),
  lifetime: Lifetime.Transient
});
```

New instance returned on each resolution.

------------------------------------------------------------------------

## 🏷 Injection by Token

``` ts
const API_URL = Symbol("API_URL");

container.register(API_URL, {
  useValue: "https://api.example.com"
});

@Injectable()
class ApiService {
  constructor(@Inject(API_URL) private url: string) {}
}
```

------------------------------------------------------------------------

## 🏗 Factory Providers

``` ts
container.register(NOW, {
  useFactory: () => Date.now(),
  lifetime: Lifetime.Transient
});
```

------------------------------------------------------------------------

## 🔄 Circular Dependency Detection

The container detects circular dependencies and throws a
`CircularDependencyError`.

------------------------------------------------------------------------

## ⚙️ TypeScript Configuration

Make sure your `tsconfig.json` includes:

``` json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

------------------------------------------------------------------------

## 🧠 How It Works

When you call:

``` ts
container.resolve(UserService);
```

The container:

1.  Reads constructor parameter types via `reflect-metadata`
2.  Resolves each dependency recursively
3.  Applies lifetime rules
4.  Detects circular dependency chains

------------------------------------------------------------------------

## 🧪 Running Tests

``` bash
npm test
```

------------------------------------------------------------------------

## 📄 License

MIT © Tony Guerra
