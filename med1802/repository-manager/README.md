# 🔄 Repository Manager v3

A lightweight, type-safe repository manager with dependency injection, scope management, lifecycle management, and multi-workspace support for TypeScript/JavaScript applications.

## ✨ Features

- ✅ **Dependency Injection** - Inject infrastructure dependencies into repositories
- ✅ **Scope Management** - Runtime scoped state management
- ✅ **Lifecycle Management** - Automatic connection/disconnection with reference counting
- ✅ **Multi-Workspace Support** - Manage multiple isolated workspaces with different dependencies
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Lazy Initialization** - Repository instances are created only when needed
- ✅ **Workspace Pattern** - `createApp` pattern for clean API
- ✅ **Logging** - Built-in logging with colored console output
- ✅ **Memory Efficient** - Automatic cleanup when no connections remain
- ✅ **Middleware Support** - Intercept and modify repository method calls

## 📦 Installation

```bash
npm install @med1802/repository-manager
```

## 🚀 Quick Start

```typescript
import { repositoryManager } from "@med1802/repository-manager";

// Define your repository interface
interface IUserRepository {
  getUsers(): Promise<User[]>;
  createUser(user: User): Promise<User>;
}

// Create manager instance
const manager = repositoryManager();

// Define infrastructure dependencies
const infrastructure = {
  httpClient: {
    get: async (url: string) => fetch(url).then((r) => r.json()),
    post: async (url: string, data: any) =>
      fetch(url, { method: "POST", body: JSON.stringify(data) }),
  },
};

// Create workspace (entry point for all operations)
const { defineRepository, queryRepository, createScope } = manager.workspace(
  infrastructure,
  {
    id: "app",
    logging: true,
  }
);

// Define repository
defineRepository<IUserRepository>({
  id: "user-repo",
  install({ instance }) {
    const { infrastructure } = instance;
    return {
      async getUsers() {
        return infrastructure.httpClient.get("/api/users");
      },
      async createUser(user) {
        return infrastructure.httpClient.post("/api/users", user);
      },
    };
  },
  onConnect: () => {
    console.log("User repository initialized");
  },
  onDisconnect: () => {
    console.log("User repository cleaned up");
  },
});

// Query and use repository
const { repository: userRepo, disconnect } =
  queryRepository<IUserRepository>("user-repo");
const users = await userRepo.getUsers();

// Cleanup when done
disconnect();
```

## 📖 Core Concepts

### 1. Manager → Workspace → Repository

Repository Manager follows a hierarchical pattern `createApp`:

```typescript
const manager = repositoryManager();              // Global manager
const workspace = manager.workspace(infrastructure, config);  // Workspace instance
workspace.defineRepository({...});                // Define repositories
workspace.queryRepository("repo-id");             // Query repositories
```

### 2. Workspace Pattern

Workspace is the **entry point** for all operations. It encapsulates:

- Infrastructure dependencies
- Repository definitions
- Scope management
- Logging configuration

```typescript
const { defineRepository, queryRepository, createScope } = manager.workspace(
  infrastructure,
  {
    id: "app-workspace",
    logging: true,
  }
);
```

### 3. Scope Management

Scopes provide **runtime scoped state management** :

```typescript
// Create scope
const userScope = createScope({
  userId: null,
  permissions: [],
});

// Use in repository
defineRepository({
  id: "auth-repo",
  install({ instance }) {
    const { useScope } = instance;
    return {
      checkPermission(action: string) {
        const user = useScope(userScope);
        return user.permissions.includes(action);
      },
    };
  },
});

// Provide scope value
userScope.provider({
  value: {
    userId: "123",
    permissions: ["read", "write"],
  },
  children() {
    const { repository } = queryRepository("auth-repo");
    repository.checkPermission("write"); // Has access to scoped value
  },
});
```

## 📚 API Reference

### `repositoryManager()`

Creates a repository manager instance.

**Returns:** Manager object with `workspace` method

**Example:**

```typescript
const manager = repositoryManager();
```

### `manager.workspace<I>(infrastructure, config)`

Creates a workspace with infrastructure dependencies.

**Parameters:**

- `infrastructure: I` - Infrastructure dependencies to inject into repositories
- `config: IConfiguration`
  - `id: string` - Unique identifier for the workspace
  - `logging?: boolean` - Enable/disable logging (default: `false`)

**Returns:** Object with workspace methods:

- `defineRepository` - Define repositories
- `queryRepository` - Query repositories
- `createScope` - Create scoped state

**Example:**

```typescript
const { defineRepository, queryRepository, createScope } = manager.workspace(
  infrastructure,
  {
    id: "app",
    logging: true,
  }
);
```

### `defineRepository<R>(config)`

Defines a repository within the workspace.

**Parameters:**

- `config: IRepositoryPlugin<I, R>`
  - `id: string` - Unique identifier for the repository
  - `install: ({ instance }) => R` - Factory function that returns repository instance
    - `instance.infrastructure` - Injected infrastructure
    - `instance.useScope` - Function to access scoped state
  - `onConnect?: () => void` - Called when repository is first connected
  - `onDisconnect?: () => void` - Called when repository is last disconnected
  - `middlewares?: Middleware[]` - Array of middleware functions

**Example:**

```typescript
defineRepository<IUserRepository>({
  id: "user-repo",
  install({ instance }) {
    const { infrastructure, useScope } = instance;
    return {
      getUsers() {
        return infrastructure.httpClient.get("/users");
      },
    };
  },
  onConnect: () => console.log("Connected"),
  onDisconnect: () => console.log("Disconnected"),
});
```

### `queryRepository<R>(id)`

Queries a repository from the workspace.

**Parameters:**

- `id: string` - Repository identifier

**Returns:** Object with:

- `repository: R` - The repository instance
- `disconnect: () => void` - Function to disconnect and cleanup

**Throws:** `Error` if repository is not found

**Example:**

```typescript
const { repository, disconnect } =
  queryRepository<IUserRepository>("user-repo");
await repository.getUsers();
disconnect();
```

### `createScope<V>(defaultValue)`

Creates a scope for runtime state management.

**Parameters:**

- `defaultValue: V` - Default value for the scope

**Returns:** Scope object with:

- `provider: (options) => void` - Provide scoped value
- `currentValue: V` - Current scoped value (getter)

**Example:**

```typescript
const userScope = createScope({
  userId: null,
  role: "guest",
});

// Provide value
userScope.provider({
  value: { userId: "123", role: "admin" },
  children() {
    // Code that runs with scoped value
  },
});
```

### `useScope<V>(scope)`

Access scoped state within repository methods.

**Parameters:**

- `scope: IScope<V>` - Scope to access

**Returns:** Current scoped value

**Example:**

```typescript
defineRepository({
  id: "auth-repo",
  install({ instance }) {
    const { useScope } = instance;
    return {
      getCurrentUser() {
        return useScope(userScope);
      },
    };
  },
});
```

## 🎯 Advanced Usage

### Multiple Scopes

You can create and use multiple scopes:

```typescript
const userScope = createScope({ userId: null });
const companyScope = createScope({ companyId: null });
const featureFlagsScope = createScope({ features: [] });

defineRepository({
  id: "billing-repo",
  install({ instance }) {
    const { useScope } = instance;
    return {
      getBillingInfo() {
        const user = useScope(userScope);
        const company = useScope(companyScope);
        const flags = useScope(featureFlagsScope);

        // Use all scopes
        return { user, company, flags };
      },
    };
  },
});
```

### Nested Scopes

Scopes can be nested and override outer values:

```typescript
userScope.provider({
  value: { userId: "outer" },
  children() {
    // Inner scope overrides outer
    userScope.provider({
      value: { userId: "inner" },
      children() {
        const { repository } = queryRepository("user-repo");
        // useScope(userScope) returns "inner"
      },
    });
  },
});
```

### Multiple Workspaces

Create multiple isolated workspaces with different dependencies:

```typescript
// API workspace
const apiWorkspace = manager.workspace(
  {
    httpClient: apiClient,
    cache: redisCache,
  },
  { id: "api" }
);

// Database workspace
const dbWorkspace = manager.workspace(
  {
    db: postgresClient,
    logger: winstonLogger,
  },
  { id: "database" }
);

// Each workspace has isolated repositories
apiWorkspace.defineRepository({...});
dbWorkspace.defineRepository({...});
```

### TypeScript Best Practices

Define clear interfaces for type safety:

```typescript
// Infrastructure interface
interface IInfrastructure {
  httpClient: IHttpClient;
  cache: ICache;
  logger: ILogger;
}

// Repository interface
interface IUserRepository {
  getUsers(): Promise<User[]>;
  createUser(user: User): Promise<User>;
}

// Workspace with typed infrastructure
const { defineRepository, queryRepository } =
  manager.workspace<IInfrastructure>(infrastructure, { id: "app" });

// Repository with typed interface
defineRepository<IUserRepository>({
  id: "user-repo",
  install({ instance }) {
    const { infrastructure } = instance;
    return {
      async getUsers() {
        // TypeScript knows infrastructure type
        return infrastructure.httpClient.get("/users");
      },
      async createUser(user) {
        // TypeScript validates User type
        return infrastructure.httpClient.post("/users", user);
      },
    };
  },
});

// Query with typed repository
const { repository } = queryRepository<IUserRepository>("user-repo");
// TypeScript knows all repository methods
```

### Lifecycle Management

Repositories use reference counting for automatic lifecycle:

```typescript
// First query creates instance (onConnect called)
const conn1 = queryRepository("user-repo"); // Connections: 1

// Subsequent queries reuse instance (onConnect NOT called)
const conn2 = queryRepository("user-repo"); // Connections: 2
const conn3 = queryRepository("user-repo"); // Connections: 3

// Disconnect reduces count
conn1.disconnect(); // Connections: 2
conn2.disconnect(); // Connections: 1

// Last disconnect destroys instance (onDisconnect called)
conn3.disconnect(); // Connections: 0, instance destroyed
```

### Middleware

Intercept and modify repository method calls:

```typescript
const loggingMiddleware: Middleware = (method, args, next) => {
  console.log(`Calling ${method}`, args);
  const result = next();
  console.log(`${method} returned:`, result);
  return result;
};

const cacheMiddleware: Middleware = (method, args, next) => {
  const cacheKey = `${method}-${JSON.stringify(args)}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const result = next();
  cache.set(cacheKey, result);
  return result;
};

defineRepository({
  id: "user-repo",
  install({ instance }) {
    return {
      getUsers: () => instance.infrastructure.httpClient.get("/users"),
    };
  },
  middlewares: [loggingMiddleware, cacheMiddleware],
});
```

**Common Middleware Use Cases:**

- **Logging** - Log all method calls and results
- **Caching** - Cache method results
- **Validation** - Validate arguments before execution
- **Performance Monitoring** - Measure execution time
- **Error Handling** - Centralized error handling and retry logic
- **Authentication** - Check permissions before execution

### Real-World Example: User Management

```typescript
// Define scopes
const authScope = createScope({ token: null, user: null });
const featureFlagsScope = createScope({ features: [] });

// Infrastructure
const infrastructure = {
  httpClient: {
    get: async (url) =>
      fetch(url, {
        headers: { Authorization: `Bearer ${useScope(authScope).token}` },
      }).then((r) => r.json()),
    post: async (url, data) =>
      fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${useScope(authScope).token}` },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  },
  cache: new Map(),
};

// Create workspace
const { defineRepository, queryRepository } = manager.workspace(
  infrastructure,
  { id: "app", logging: true }
);

// Define repositories
defineRepository<IUserRepository>({
  id: "user-repo",
  install({ instance }) {
    const { infrastructure, useScope } = instance;
    return {
      async getUsers() {
        const auth = useScope(authScope);
        if (!auth.token) throw new Error("Not authenticated");
        return infrastructure.httpClient.get("/api/users");
      },
      async createUser(user) {
        const flags = useScope(featureFlagsScope);
        if (!flags.features.includes("create-user")) {
          throw new Error("Feature not enabled");
        }
        return infrastructure.httpClient.post("/api/users", user);
      },
    };
  },
  onConnect: () => console.log("User repo connected"),
  onDisconnect: () => console.log("User repo disconnected"),
});

// Use with authentication
authScope.provider({
  value: { token: "abc123", user: { id: "1", name: "John" } },
  children() {
    featureFlagsScope.provider({
      value: { features: ["create-user", "delete-user"] },
      async children() {
        const { repository, disconnect } =
          queryRepository<IUserRepository>("user-repo");

        // Has access to auth and feature flags
        const users = await repository.getUsers();
        await repository.createUser({ name: "Jane" });

        disconnect();
      },
    });
  },
});
```

### Logging

Enable logging to see connection lifecycle:

```typescript
const { defineRepository } = manager.workspace(infrastructure, {
  id: "app",
  logging: true, // Enables colored console output
});

// Console output will show:
// repository.define (user-repo)
// ┌─────────┬───────────┐
// │ (index) │repository │
// ├─────────┼───────────┤
// │    0    │ user-repo │
// └─────────┴───────────┘
//
// repository.connect (user-repo)
// ┌─────────┬───────────┬─────────────┐
// │ (index) │repository │ connections │
// ├─────────┼───────────┼─────────────┤
// │    0    │ user-repo │      1      │
// └─────────┴───────────┴─────────────┘
```

## 🏗️ Design Patterns

This library implements several design patterns:

- **Dependency Injection** - Dependencies are injected into repositories
- **Factory Pattern** - Repositories are created using factory functions
- **Singleton Pattern** - Each repository is a singleton per workspace (with reference counting)
- **Repository Pattern** - Abstracts data access logic
- **Workspace Pattern** - Vue-like pattern for managing dependencies and lifecycle
- **Provider Pattern** - Scope management similar to React Context

## ⚠️ Error Handling

```typescript
try {
  const { repository } = queryRepository("non-existent-repo");
} catch (error) {
  console.error(error.message); // Repository "non-existent-repo" not found
}

// With scope
try {
  const user = useScope(userScope);
  if (!user) throw new Error("No user in scope");
} catch (error) {
  console.error("Scope error:", error);
}
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
