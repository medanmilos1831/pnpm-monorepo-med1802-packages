# 🔄 Repository Manager

A lightweight, type-safe repository manager with dependency injection and lifecycle management for TypeScript/JavaScript applications.

## Features

- ✅ **Dependency Injection** - Inject infrastructure dependencies into repositories
- ✅ **Lifecycle Management** - Automatic connection/disconnection with reference counting
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Lazy Initialization** - Repository instances are created only when needed
- ✅ **Logging** - Built-in logging with colored console output
- ✅ **Memory Efficient** - Automatic cleanup when no connections remain

## Installation

```bash
npm install @med1802/repository-manager
```

## Quick Start

```typescript
import { repositoryManager } from "@med1802/repository-manager";

// Define your infrastructure
interface IInfrastructure {
  httpClient: {
    get(url: string): Promise<any>;
    post(url: string, data: any): Promise<any>;
  };
}

// Create container with infrastructure
const manager = repositoryManager();
const app = manager.createContainer<IInfrastructure>({
  httpClient: {
    get: async (url) => fetch(url).then((r) => r.json()),
    post: async (url, data) =>
      fetch(url, { method: "POST", body: JSON.stringify(data) }),
  },
});

// Define repository
app.defineRepository("user-repo", (infrastructure) => {
  return {
    async getUsers() {
      return infrastructure.httpClient.get("/api/users");
    },
    async createUser(user: any) {
      return infrastructure.httpClient.post("/api/users", user);
    },
  };
});

// Use repository
const { repository, disconnect } = app.queryRepository("user-repo");
const users = await repository.getUsers();

// Cleanup when done
disconnect();
```

## API

### `repositoryManager()`

Creates a new repository manager instance.

```typescript
const manager = repositoryManager();
```

### `createContainer<I>(infrastructure: I, config?: IConfiguration)`

Creates a container with infrastructure dependencies.

**Parameters:**

- `infrastructure` - Object containing all infrastructure dependencies
- `config` - Optional configuration object
  - `logging?: boolean` - Enable/disable logging (default: `false`)

**Returns:** Container object with `defineRepository` and `queryRepository` methods.

### `defineRepository(id: string, definition: (infrastructure: I) => T)`

Defines a repository with a unique ID.

**Parameters:**

- `id` - Unique identifier for the repository
- `definition` - Function that receives infrastructure and returns repository object

### `queryRepository<T>(id: string)`

Queries a repository by ID and returns it with disconnect method.

**Parameters:**

- `id` - Repository identifier

**Returns:** Object with:

- `repository: T` - The repository instance
- `disconnect: () => void` - Method to disconnect and cleanup

## Advanced Usage

### With Configuration

```typescript
const app = manager.createContainer(infrastructure, {
  logging: true, // Enable colored console logging
});
```

### Multiple Repositories

```typescript
app.defineRepository("user-repo", (infrastructure) => ({
  getUsers: () => infrastructure.httpClient.get("/users"),
}));

app.defineRepository("post-repo", (infrastructure) => ({
  getPosts: () => infrastructure.httpClient.get("/posts"),
}));

const userRepo = app.queryRepository("user-repo");
const postRepo = app.queryRepository("post-repo");
```

### Lifecycle Management

Repositories use reference counting. The instance is created on first `queryRepository` call and destroyed when all connections are disconnected.

```typescript
const repo1 = app.queryRepository("user-repo"); // Creates instance
const repo2 = app.queryRepository("user-repo"); // Reuses instance
const repo3 = app.queryRepository("user-repo"); // Reuses instance

repo1.disconnect(); // Still active (2 connections remain)
repo2.disconnect(); // Still active (1 connection remains)
repo3.disconnect(); // Instance destroyed
```

## Dependency Injection Pattern

This package follows the Dependency Inversion Principle (DIP):

- **High-level modules** (repositories) depend on abstractions (infrastructure interface)
- **Low-level modules** (infrastructure implementations) are injected
- Easy to test with mock infrastructure
- Easy to swap implementations

```typescript
// Define infrastructure interface
interface IInfrastructure {
  database: IDatabase;
  cache: ICache;
}

// Inject concrete implementations
const app = manager.createContainer<IInfrastructure>({
  database: new PostgreSQL(),
  cache: new RedisCache(),
});

// Repository depends only on interface
app.defineRepository("user-repo", (infrastructure) => ({
  // Uses infrastructure.database and infrastructure.cache
}));
```

## License

MIT
