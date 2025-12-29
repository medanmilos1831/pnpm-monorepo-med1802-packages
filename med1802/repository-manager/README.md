# 🔄 Repository Manager

A lightweight, type-safe repository manager with dependency injection, lifecycle management, and multi-workspace support for TypeScript/JavaScript applications.

## Features

- ✅ **Dependency Injection** - Inject infrastructure dependencies into repositories
- ✅ **Lifecycle Management** - Automatic connection/disconnection with reference counting
- ✅ **Multi-Workspace Support** - Manage multiple isolated workspaces with different dependencies
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Lazy Initialization** - Repository instances are created only when needed
- ✅ **Imperative API** - Define workspaces and repositories as needed
- ✅ **Logging** - Built-in logging with colored console output
- ✅ **Memory Efficient** - Automatic cleanup when no connections remain

## Installation

```bash
npm install @med1802/repository-manager
```

## Quick Start

```typescript
import { repositoryManager } from "@med1802/repository-manager";

// Define your dependencies interface
interface IDependencies {
  httpClient: {
    get(url: string): Promise<any>;
    post(url: string, data: any): Promise<any>;
  };
}

// Create manager instance
const manager = repositoryManager();

// Define infrastructure dependencies
const infrastructure: IDependencies = {
  httpClient: {
    get: async (url) => fetch(url).then((r) => r.json()),
    post: async (url, data) =>
      fetch(url, { method: "POST", body: JSON.stringify(data) }),
  },
};

// Create a workspace and define repositories
const { defineRepository } = manager.workspace(infrastructure, {
  id: "app",
  logging: true,
});

// Define repositories
defineRepository("userRepo", (infrastructure) => ({
  async getUsers() {
    return infrastructure.httpClient.get("/api/users");
  },
  async createUser(user: any) {
    return infrastructure.httpClient.post("/api/users", user);
  },
}));

defineRepository("postRepo", (infrastructure) => ({
  async getPosts() {
    return infrastructure.httpClient.get("/api/posts");
  },
}));

// Use repositories with path format: "workspaceId/repositoryId"
const { repository: userRepo, disconnect } = manager.query("app/userRepo");
const users = await userRepo.getUsers();

// Cleanup when done
disconnect();
```

## API Reference

### `repositoryManager()`

Creates a repository manager instance.

**Returns:** Manager object with `workspace` and `query` methods

**Example:**

```typescript
const manager = repositoryManager();
```

### `manager.workspace<I>(infrastructure, config)`

Creates a workspace with infrastructure dependencies and returns a `defineRepository` function.

**Parameters:**

- `infrastructure: I` - Infrastructure dependencies to inject into repositories
- `config: IConfiguration` - Workspace configuration
  - `id: string` - Unique identifier for the workspace
  - `logging?: boolean` - Enable/disable logging (default: `false`)

**Returns:** Object with `defineRepository` method

**Example:**

```typescript
const { defineRepository } = manager.workspace(infrastructure, {
  id: "app",
  logging: true,
});
```

### `defineRepository(id, factory, config?)`

Defines a repository within the workspace.

**Parameters:**

- `id: string` - Unique identifier for the repository
- `factory: (infrastructure: I) => R` - Factory function that receives infrastructure and returns repository instance
- `config?: IRepositoryConfig` - Optional repository configuration
  - `lifecycle?: ILifeCycle` - Lifecycle hooks
    - `onConnect?: () => void` - Called when repository is first connected (when connections go from 0 to 1)
    - `onDisconnect?: () => void` - Called when repository is last disconnected (when connections go from 1 to 0)

**Example:**

```typescript
defineRepository("userRepo", (infrastructure) => ({
  getUsers: () => infrastructure.httpClient.get("/users"),
}));

// With lifecycle hooks
defineRepository(
  "userRepo",
  (infrastructure) => ({
    getUsers: () => infrastructure.httpClient.get("/users"),
  }),
  {
    lifecycle: {
      onConnect: () => {
        console.log("User repository initialized");
      },
      onDisconnect: () => {
        console.log("User repository cleaned up");
      },
    },
  }
);
```

### `manager.query<R>(path)`

Queries a repository from a workspace using path format: `"workspaceId/repositoryId"`.

**Parameters:**

- `path: string` - Path to repository in format `"workspaceId/repositoryId"`

**Returns:** Object with:

- `repository: R` - The repository instance
- `disconnect: () => void` - Function to disconnect and cleanup

**Throws:** `Error` if workspace or repository is not found

**Example:**

```typescript
const { repository, disconnect } = manager.query<IUserRepo>("app/userRepo");
await repository.getUsers();
disconnect();
```

## Advanced Usage

### Multiple Workspaces

You can create multiple isolated workspaces with different dependencies:

```typescript
const manager = repositoryManager();

// API workspace
const { defineRepository: defineApiRepo } = manager.workspace(
  {
    httpClient: apiHttpClient,
    cache: redisCache,
  },
  {
    id: "api",
    logging: true,
  }
);

defineApiRepo("userRepo", (infrastructure) => ({
  getUsers: () => infrastructure.httpClient.get("/users"),
}));

// Database workspace
const { defineRepository: defineDbRepo } = manager.workspace(
  {
    db: postgresClient,
    logger: winstonLogger,
  },
  {
    id: "database",
    logging: false,
  }
);

defineDbRepo("orderRepo", (infrastructure) => ({
  getOrders: () => infrastructure.db.query("SELECT * FROM orders"),
}));

// Access repositories from different workspaces
const { repository: userRepo } = manager.query("api/userRepo");
const { repository: orderRepo } = manager.query("database/orderRepo");
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

const manager = repositoryManager();

const { defineRepository } = manager.workspace<IDependencies>(
  {
    httpClient: myHttpClient,
    cache: myCache,
  },
  {
    id: "app",
  }
);

defineRepository<IUserRepo>(
  "userRepo",
  (infrastructure): IUserRepo => ({
    async getUsers() {
      /* ... */
    },
    async createUser(user) {
      /* ... */
    },
    async updateUser(id, user) {
      /* ... */
    },
    async deleteUser(id) {
      /* ... */
    },
  })
);

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

### Lifecycle Hooks

You can define lifecycle hooks that are called at specific points in the repository lifecycle:

- **`onConnect`** - Called only when the repository is first connected (when connections go from 0 to 1)
- **`onDisconnect`** - Called only when the repository is last disconnected (when connections go from 1 to 0)

**Example:**

```typescript
defineRepository(
  "userRepo",
  (infrastructure) => ({
    getUsers: () => infrastructure.httpClient.get("/api/users"),
  }),
  {
    lifecycle: {
      onConnect: () => {
        console.log("User repository initialized");
        // Perform initialization tasks (e.g., setup cache, establish connection)
      },
      onDisconnect: () => {
        console.log("User repository cleaned up");
        // Perform cleanup tasks (e.g., clear cache, close connections)
      },
    },
  }
);

// Usage
const conn1 = manager.query("app/userRepo"); // onConnect called (first connection)
const conn2 = manager.query("app/userRepo"); // onConnect NOT called (reusing instance)

conn1.disconnect(); // onDisconnect NOT called (still has connections)
conn2.disconnect(); // onDisconnect called (last connection removed)
```

**Use Cases:**

- **Initialization**: Setup cache, establish database connections, initialize state
- **Cleanup**: Clear cache, close connections, release resources
- **Analytics**: Track repository usage and lifecycle events
- **Debugging**: Monitor when repositories are created and destroyed

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
const manager = repositoryManager();

const { defineRepository } = manager.workspace(infrastructure, {
  id: "app",
  logging: true, // Enables colored console output
});

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
const manager = repositoryManager();

const { defineRepository } = manager.workspace<IDependencies>(
  {
    database: new PostgreSQLClient(),
    cache: new RedisCache(),
  },
  {
    id: "prod",
  }
);

// Easy to test with mocks
const { defineRepository: defineTestRepo } = manager.workspace<IDependencies>(
  {
    database: new MockDatabase(),
    cache: new MockCache(),
  },
  {
    id: "test",
  }
);
```

## Design Patterns

This library implements several design patterns:

- **Dependency Injection** - Dependencies are injected into repositories
- **Factory Pattern** - Repositories are created using factory functions
- **Singleton Pattern** - Each repository is a singleton per workspace (with reference counting)
- **Repository Pattern** - Abstracts data access logic
- **Workspace Pattern** - Manages dependencies and lifecycle

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
2. **Use one workspace per context** - Separate API, database, etc.
3. **Always call disconnect** - Proper cleanup prevents memory leaks
4. **Enable logging during development** - Helps debug lifecycle issues
5. **Keep repositories focused** - Single responsibility principle
6. **Use dependency interfaces, not concrete classes** - Easier to test and swap

## License

MIT
