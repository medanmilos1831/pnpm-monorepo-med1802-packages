# 🔄 Repository Manager

A lightweight, type-safe repository manager with dependency injection, event-driven architecture, lifecycle management, and multi-workspace support for TypeScript/JavaScript applications.

## ✨ Features

- ✅ **Dependency Injection** - Inject dependencies into repositories
- ✅ **Event-Driven Architecture** - Built-in messenger pattern for inter-repository communication
- ✅ **Plugin System** - Define repositories as plugins
- ✅ **Lifecycle Management** - Automatic connection/disconnection with reference counting
- ✅ **Multi-Workspace Support** - Manage multiple isolated workspaces with different dependencies
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Lazy Initialization** - Repository instances are created only when needed
- ✅ **Clean API** - Simple `createWorkspace` pattern
- ✅ **Logging** - Built-in logging with colored console output
- ✅ **Memory Efficient** - Automatic cleanup when no connections remain
- ✅ **Middleware Support** - Intercept and modify repository method calls
- ✅ **Fire and Forget Messaging** - Hierarchical event system for organized communication

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

// Define dependencies
const dependencies = {
  httpClient: {
    get: async (url: string) => fetch(url).then((r) => r.json()),
    post: async (url: string, data: any) =>
      fetch(url, { method: "POST", body: JSON.stringify(data) }),
  },
};

// Create workspace with repositories
const { queryRepository } = manager.createWorkspace({
  id: "app",
  logging: true,
  dependencies,
  repositories: () => [
    {
      id: "user-repo",
      install({ instance }): IUserRepository {
        const { dependencies, messenger } = instance;
        return {
          async getUsers() {
            return dependencies.httpClient.get("/api/users");
          },
          async createUser(user) {
            const result = await dependencies.httpClient.post("/api/users", user);
            // Notify other repositories about new user
            messenger.dispatch({
              type: "user.created",
              repositoryId: "user-repo",
              message: result,
            });
            return result;
          },
        };
      },
      onConnect: () => {
        console.log("User repository initialized");
      },
      onDisconnect: () => {
        console.log("User repository cleaned up");
      },
    },
  ],
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

Repository Manager follows a hierarchical pattern:

```typescript
const manager = repositoryManager();                    // Global manager
const workspace = manager.createWorkspace({             // Workspace instance
  id: "app",
  dependencies,
  logging: true,
  repositories: () => [...]                              // Define repositories
});
workspace.queryRepository("repo-id");                   // Query repositories
```

### 2. Workspace Pattern

Workspace is the **entry point** for all operations. It encapsulates:

- Dependencies (shared services/infrastructure)
- Repository definitions
- Messenger system for events
- Logging configuration

```typescript
const { queryRepository } = manager.createWorkspace({
  id: "app-workspace",
  logging: true,
  dependencies: {
    httpClient: myHttpClient,
    cache: myCache,
  },
  repositories: () => [
    // Repository definitions here
  ],
});
```

### 3. Messenger System

The built-in messenger enables **fire-and-forget inter-repository communication**:

```typescript
const { queryRepository } = manager.createWorkspace({
  id: "app",
  dependencies,
  repositories: () => [
    // Repository that dispatches events
    {
      id: "user-repo",
      install({ instance }) {
        const { messenger } = instance;
        return {
          async createUser(user) {
            const result = await saveUser(user);
            // Notify other repositories
            messenger.dispatch({
              type: "user.created",
              repositoryId: "user-repo",
              message: result,
            });
            return result;
          },
        };
      },
    },
    // Repository that subscribes to events
    {
      id: "notification-repo",
      install({ instance }) {
        const { messenger } = instance;
        
        // Subscribe to user events
        messenger.subscribe((payload) => {
          if (payload.type === "user.created") {
            console.log("New user:", payload.message);
            // Send welcome email, etc.
          }
        });
        
        return {
          // repository methods...
        };
      },
    },
  ],
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

### `manager.createWorkspace<D>(config)`

Creates a workspace with dependencies and plugins.

**Parameters:**

- `config: IWorkspaceConfig<D>`
  - `id: string` - Unique identifier for the workspace
  - `dependencies: D` - Dependencies to inject into repositories
  - `repositories: () => IRepositoryConfig[]` - Function that returns array of repository configs
  - `logging?: boolean` - Enable/disable logging (default: `false`)

**Returns:** Object with workspace methods:

- `queryRepository` - Query repositories

**Example:**

```typescript
const { queryRepository } = manager.createWorkspace({
  id: "app",
  dependencies: {
    httpClient: myHttpClient,
    database: myDb,
  },
  repositories: () => [
    {
      id: "user-repo",
      install({ instance }) {
        // repository implementation
      },
    },
  ],
  logging: true,
});
```

### Repository Definition

Defines a repository within the workspace.

**Repository Structure:**

- `IRepositoryConfig<D, R>`
  - `id: string` - Unique identifier for the repository
  - `install: ({ instance }) => R` - Factory function that returns repository instance
    - `instance.dependencies` - Injected dependencies
    - `instance.messenger` - Messenger for fire-and-forget communication
  - `onConnect?: () => void` - Called when repository is first connected
  - `onDisconnect?: () => void` - Called when repository is last disconnected
  - `middlewares?: Middleware[]` - Array of middleware functions

**Example:**

```typescript
repositories: () => [
  {
    id: "user-repo",
    install({ instance }): IUserRepository {
      const { dependencies, messenger } = instance;
      
      // Subscribe to events
      messenger.subscribe((payload) => {
        console.log("Event received:", payload);
      });
      
      return {
        async createUser(user) {
          const result = await dependencies.httpClient.post("/users", user);
          // Dispatch event
          messenger.dispatch({
            type: "user.created",
            repositoryId: "user-repo",
            message: result,
          });
          return result;
        },
      };
    },
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
  },
]
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

### `messenger.dispatch<P>(payload)`

Dispatch an event to notify other repositories (fire-and-forget).

**Parameters:**

- `payload: IMessengerDispatch<P>`
  - `type: string` - Event type identifier
  - `repositoryId: string` - Target repository identifier
  - `message?: P` - Optional payload data

**Example:**

```typescript
messenger.dispatch({
  type: "user.created",
  repositoryId: "notification-repo",
  message: { userId: "123", email: "user@example.com" },
});
```

### `messenger.subscribe<P>(callback)`

Subscribe to events from other repositories.

**Parameters:**

- `callback: (payload: IMessengerSubscribePayload<P>) => void` - Callback function
  - `payload.type: string` - Event type
  - `payload.source: string` - Source repository
  - `payload.message: P` - Event payload

**Example:**

```typescript
messenger.subscribe((payload) => {
  if (payload.type === "user.created") {
    console.log("User created:", payload.message);
    console.log("From repository:", payload.source);
  }
});
```

## 🎯 Advanced Usage

### Messenger System Benefits

The built-in messenger system enables decoupled communication between repositories:

**Benefits:**

- **Loose Coupling** - Repositories don't need to know about each other
- **Scalability** - Easy to add new listeners without modifying existing code
- **Event Sourcing** - Track all events in your system
- **Side Effects** - Handle cross-cutting concerns (logging, analytics, notifications)

**When to Use:**

- Cross-repository notifications
- Audit logging
- Analytics tracking
- Email/SMS notifications
- Cache invalidation
- Webhook triggers

### Event-Driven Communication

Repositories can communicate through the messenger system:

```typescript
const { queryRepository } = manager.createWorkspace({
  id: "app",
  dependencies: {
    httpClient: myHttpClient,
    emailService: myEmailService,
  },
  repositories: () => [
    // User repository dispatches events
    {
      id: "user-repo",
      install({ instance }) {
        const { dependencies, messenger } = instance;
        return {
          async createUser(user) {
            const result = await dependencies.httpClient.post("/users", user);
            messenger.dispatch({
              type: "user.created",
              repositoryId: "notification-repo",
              message: result,
            });
            return result;
          },
          async deleteUser(userId) {
            await dependencies.httpClient.delete(`/users/${userId}`);
            messenger.dispatch({
              type: "user.deleted",
              repositoryId: "notification-repo",
              message: { userId },
            });
          },
        };
      },
    },
    // Notification repository subscribes to user events
    {
      id: "notification-repo",
      install({ instance }) {
        const { messenger, dependencies } = instance;

        messenger.subscribe((payload) => {
          if (payload.type === "user.created") {
            dependencies.emailService.send({
              to: payload.message.email,
              subject: "Welcome!",
            });
          }
          if (payload.type === "user.deleted") {
            console.log("User deleted:", payload.message.userId);
          }
        });

        return {
          // notification methods...
        };
      },
    },
    // Analytics repository also subscribes
    {
      id: "analytics-repo",
      install({ instance }) {
        const { messenger } = instance;

        messenger.subscribe((payload) => {
          if (payload.type === "user.created") {
            console.log("Track new user:", payload.message);
          }
        });

        return {
          // analytics methods...
        };
      },
    },
  ],
});
```

### Multiple Workspaces

Create multiple isolated workspaces with different dependencies:

```typescript
// API workspace
const apiWorkspace = manager.createWorkspace({
  id: "api",
  dependencies: {
    httpClient: apiClient,
    cache: redisCache,
  },
  repositories: () => [
    // API repositories
  ],
  logging: true,
});

// Database workspace
const dbWorkspace = manager.createWorkspace({
  id: "database",
  dependencies: {
    db: postgresClient,
    logger: winstonLogger,
  },
  repositories: () => [
    // Database repositories
  ],
  logging: false,
});

// Each workspace has isolated repositories and messengers
```

### TypeScript Best Practices

Define clear interfaces for type safety:

```typescript
// Dependencies interface
interface IDependencies {
  httpClient: IHttpClient;
  cache: ICache;
  logger: ILogger;
}

// Repository interface
interface IUserRepository {
  getUsers(): Promise<User[]>;
  createUser(user: User): Promise<User>;
}

// Workspace with typed dependencies
const { queryRepository } = manager.createWorkspace<IDependencies>({
  id: "app",
  dependencies,
  repositories: () => [
    {
      id: "user-repo",
      install({ instance }): IUserRepository {
        const { dependencies } = instance;
        return {
          async getUsers() {
            // TypeScript knows dependencies type
            return dependencies.httpClient.get("/users");
          },
          async createUser(user) {
            // TypeScript validates User type
            return dependencies.httpClient.post("/users", user);
          },
        };
      },
    },
  ],
  logging: true,
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

const { queryRepository } = manager.createWorkspace({
  dependencies,
  repositories: () => [
    {
      id: "user-repo",
      install({ instance }) {
        return {
          getUsers: () => instance.dependencies.httpClient.get("/users"),
        };
      },
      middlewares: [loggingMiddleware, cacheMiddleware],
    },
  ],
});
```

**Common Middleware Use Cases:**

- **Logging** - Log all method calls and results
- **Caching** - Cache method results
- **Validation** - Validate arguments before execution
- **Performance Monitoring** - Measure execution time
- **Error Handling** - Centralized error handling and retry logic
- **Authentication** - Check permissions before execution

### Logging

Enable logging to see connection lifecycle and events:

```typescript
const { queryRepository } = manager.createWorkspace({
  id: "app",
  dependencies,
  repositories: () => [
    // repositories here
  ],
  logging: true, // Enables colored console output
});
```

## 🏗️ Design Patterns

This library implements several design patterns:

- **Dependency Injection** - Dependencies are injected into repositories
- **Factory Pattern** - Repositories are created using factory functions
- **Singleton Pattern** - Each repository is a singleton per workspace (with reference counting)
- **Repository Pattern** - Abstracts data access logic
- **Messenger Pattern** - Fire-and-forget communication between repositories
- **Workspace Pattern** - Clean API for managing dependencies and lifecycle
- **Pub/Sub Pattern** - Repositories can publish and subscribe to events
