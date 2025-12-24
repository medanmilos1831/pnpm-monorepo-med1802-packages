# 🔄 Repository Manager

A lightweight, type-safe repository manager with dependency injection, lifecycle management, and multi-container support for TypeScript/JavaScript applications.

## Features

- ✅ **Dependency Injection** - Inject infrastructure dependencies into repositories
- ✅ **Lifecycle Management** - Automatic connection/disconnection with reference counting
- ✅ **Multi-Container Support** - Manage multiple isolated containers with different dependencies
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Lazy Initialization** - Repository instances are created only when needed
- ✅ **Declarative API** - Define all containers and repositories upfront
- ✅ **Logging** - Built-in logging with colored console output
- ✅ **Memory Efficient** - Automatic cleanup when no connections remain

## Installation

```bash
npm install @med1802/repository-manager
```

## Quick Start

```typescript
import { createRepositoryManager } from "@med1802/repository-manager";

// Define your dependencies interface
interface IDependencies {
  httpClient: {
    get(url: string): Promise<any>;
    post(url: string, data: any): Promise<any>;
  };
}

// Create manager with container configuration
const manager = createRepositoryManager<IDependencies>([
  {
    id: "app-container",
    dependencies: {
      httpClient: {
        get: async (url) => fetch(url).then((r) => r.json()),
        post: async (url, data) =>
          fetch(url, { method: "POST", body: JSON.stringify(data) }),
      },
    },
    repositories: {
      userRepo: (deps) => ({
        async getUsers() {
          return deps.httpClient.get("/api/users");
        },
        async createUser(user: any) {
          return deps.httpClient.post("/api/users", user);
        },
      }),
      postRepo: (deps) => ({
        async getPosts() {
          return deps.httpClient.get("/api/posts");
        },
      }),
    },
    logging: true,
  },
]);

// Use repositories with path format: "containerId/repositoryId"
const { repository: userRepo, disconnect } = manager.query("app-container/userRepo");
const users = await userRepo.getUsers();

// Cleanup when done
disconnect();
```

## API Reference

### `createRepositoryManager<D>(config)`

Creates a repository manager instance with one or more containers.

**Parameters:**

- `config: IManagerConfig<D>[]` - Array of container configurations

Each container configuration has:
- `id: string` - Unique identifier for the container
- `dependencies: D` - Infrastructure dependencies to inject into repositories
- `repositories: Record<string, (deps: D) => T>` - Object mapping repository IDs to factory functions
- `logging?: boolean` - Enable/disable logging (default: `false`)

**Returns:** Manager object with `query` method

**Example:**

```typescript
const manager = createRepositoryManager([
  {
    id: "main-container",
    dependencies: { /* ... */ },
    repositories: { /* ... */ },
    logging: true,
  },
]);
```

### `manager.query<R>(path)`

Queries a repository from a container using path format: `"containerId/repositoryId"`.

**Parameters:**

- `path: string` - Path to repository in format `"containerId/repositoryId"`

**Returns:** Object with:
- `repository: R` - The repository instance
- `disconnect: () => void` - Function to disconnect and cleanup

**Throws:** `Error` if container or repository is not found

**Example:**

```typescript
const { repository, disconnect } = manager.query<IUserRepo>("app-container/userRepo");
await repository.getUsers();
disconnect();
```

## Advanced Usage

### Multiple Containers

You can create multiple isolated containers with different dependencies:

```typescript
const manager = createRepositoryManager([
  {
    id: "api-container",
    dependencies: {
      httpClient: apiHttpClient,
      cache: redisCache,
    },
    repositories: {
      userRepo: (deps) => ({
        getUsers: () => deps.httpClient.get("/users"),
      }),
    },
  },
  {
    id: "database-container",
    dependencies: {
      db: postgresClient,
      logger: winstonLogger,
    },
    repositories: {
      orderRepo: (deps) => ({
        getOrders: () => deps.db.query("SELECT * FROM orders"),
      }),
    },
  },
]);

// Access repositories from different containers
const { repository: userRepo } = manager.query("api-container/userRepo");
const { repository: orderRepo } = manager.query("database-container/orderRepo");
```

### TypeScript Interfaces

Define clear interfaces for better type safety:

```typescript
interface IUserRepo {
  getUsers(): Promise<User[]>;
  createUser(user: User): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

interface IDependencies {
  httpClient: IHttpClient;
  cache: ICache;
}

const manager = createRepositoryManager<IDependencies>([
  {
    id: "app",
    dependencies: { /* ... */ },
    repositories: {
      userRepo: (deps): IUserRepo => ({
        async getUsers() { /* ... */ },
        async createUser(user) { /* ... */ },
        async updateUser(id, user) { /* ... */ },
        async deleteUser(id) { /* ... */ },
      }),
    },
  },
]);

// TypeScript knows the exact return type
const { repository } = manager.query<IUserRepo>("app/userRepo");
// repository has all IUserRepo methods with correct types
```

### Lifecycle Management with Reference Counting

Repositories use reference counting for automatic lifecycle management:

```typescript
// First query creates the repository instance
const conn1 = manager.query("app/userRepo"); // Connections: 1
const conn2 = manager.query("app/userRepo"); // Connections: 2 (reuses instance)
const conn3 = manager.query("app/userRepo"); // Connections: 3 (reuses instance)

conn1.disconnect(); // Connections: 2 (still active)
conn2.disconnect(); // Connections: 1 (still active)
conn3.disconnect(); // Connections: 0 (instance destroyed)

// Next query will create a new instance
const conn4 = manager.query("app/userRepo"); // Connections: 1 (new instance)
```

### Using with React

```typescript
import { useEffect } from "react";

function UserList() {
  useEffect(() => {
    const { repository, disconnect } = manager.query<IUserRepo>("app/userRepo");
    
    repository.getUsers().then(setUsers);
    
    // Cleanup on unmount
    return disconnect;
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

### Logging

Enable logging to see connection lifecycle:

```typescript
const manager = createRepositoryManager([
  {
    id: "app",
    dependencies: { /* ... */ },
    repositories: { /* ... */ },
    logging: true, // Enables colored console output
  },
]);

// Console output will show:
// repository.connect (app/userRepo)
// ┌─────────┬──────────┬─────────────┐
// │ (index) │    id    │ connections │
// ├─────────┼──────────┼─────────────┤
// │    0    │ userRepo │      1      │
// └─────────┴──────────┴─────────────┘
```

## Dependency Injection Pattern

This package follows the **Dependency Inversion Principle (DIP)**:

- **High-level modules** (repositories) depend on abstractions (dependencies interface)
- **Low-level modules** (infrastructure implementations) are injected
- Easy to test with mock dependencies
- Easy to swap implementations

```typescript
// Define abstractions
interface IDatabase {
  query(sql: string): Promise<any>;
}

interface ICache {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}

interface IDependencies {
  database: IDatabase;
  cache: ICache;
}

// Inject concrete implementations
const manager = createRepositoryManager<IDependencies>([
  {
    id: "prod",
    dependencies: {
      database: new PostgreSQLClient(),
      cache: new RedisCache(),
    },
    repositories: { /* ... */ },
  },
]);

// Easy to test with mocks
const testManager = createRepositoryManager<IDependencies>([
  {
    id: "test",
    dependencies: {
      database: new MockDatabase(),
      cache: new MockCache(),
    },
    repositories: { /* ... */ },
  },
]);
```

## Design Patterns

This library implements several design patterns:

- **Dependency Injection** - Dependencies are injected into repositories
- **Factory Pattern** - Repositories are created using factory functions
- **Singleton Pattern** - Each repository is a singleton per container (with reference counting)
- **Repository Pattern** - Abstracts data access logic
- **Container Pattern** - Manages dependencies and lifecycle

## Error Handling

```typescript
try {
  const { repository } = manager.query("non-existent/repo");
} catch (error) {
  console.error(error.message); // Container "non-existent" not found
}

try {
  const { repository } = manager.query("app/non-existent");
} catch (error) {
  console.error(error.message); // Repository "non-existent" not found
}
```

## Best Practices

1. **Define interfaces for dependencies and repositories** - Better type safety
2. **Use one container per context** - Separate API, database, etc.
3. **Always call disconnect** - Proper cleanup prevents memory leaks
4. **Enable logging during development** - Helps debug lifecycle issues
5. **Keep repositories focused** - Single responsibility principle
6. **Use dependency interfaces, not concrete classes** - Easier to test and swap

## License

MIT
