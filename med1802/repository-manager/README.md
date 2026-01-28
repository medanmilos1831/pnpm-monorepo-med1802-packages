# 🔄 Repository Manager

A lightweight, type-safe repository manager with dependency injection, event-driven architecture, lifecycle management, and multi-workspace support for TypeScript/JavaScript applications.

## ✨ Features

- ✅ **Dependency Injection** - Inject dependencies into repositories
- ✅ **Event-Driven Architecture** - Built-in signal broadcasting for inter-repository communication
- ✅ **Plugin System** - Define repositories as plugins
- ✅ **Lifecycle Management** - Automatic connection/disconnection with reference counting
- ✅ **Multi-Workspace Support** - Manage multiple isolated workspaces with different dependencies
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Lazy Initialization** - Repository instances are created only when needed
- ✅ **Clean API** - Simple `createWorkspace` pattern
- ✅ **Logging** - Built-in logging with colored console output
- ✅ **Memory Efficient** - Automatic cleanup when no connections remain
- ✅ **Middleware Support** - Intercept and modify repository method calls
- ✅ **Signal Broadcasting** - Fire-and-forget event system for decoupled communication

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
const { queryRepository } = manager.workspaceClient({
  id: "app",
  logging: true,
  dependencies,
  onSetup({ useRepository }) {
    useRepository<IUserRepository>({
      id: "user-repo",
      install({ instance }): IUserRepository {
        const { dependencies, signal } = instance;
        return {
          async getUsers() {
            return dependencies.httpClient.get("/api/users");
          },
          async createUser(user) {
            const result = await dependencies.httpClient.post("/api/users", user);
            // Broadcast signal to other repositories
            signal({
              type: "user.created",
              repositoryId: "notification-repo",
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
    });
  }
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
const workspace = manager.workspaceClient({             // Workspace instance
  id: "app",
  dependencies,
  logging: true,
  onSetup({ useRepository }) {                          // Define repositories
    useRepository({...});
  }
});
workspace.queryRepository("repo-id");                   // Query repositories
```

### 2. Workspace Pattern

Workspace is the **entry point** for all operations. It encapsulates:

- Dependencies (shared services/infrastructure)
- Repository definitions via `onSetup`
- Signal broadcasting for events
- Logging configuration

```typescript
const { queryRepository } = manager.workspaceClient({
  id: "app-workspace",
  logging: true,
  dependencies: {
    httpClient: myHttpClient,
    cache: myCache,
  },
  onSetup({ useRepository }) {
    // Register repositories here
    useRepository({...});
  },
});
```

### 3. Signal Broadcasting System

The built-in signal broadcaster enables **fire-and-forget inter-repository communication**:

```typescript
const { queryRepository } = manager.workspaceClient({
  id: "app",
  dependencies,
  onSetup({ useRepository }) {
    // Repository that broadcasts signals
    useRepository({
      id: "user-repo",
      install({ instance }) {
        const { signal } = instance;
        return {
          async createUser(user) {
            const result = await saveUser(user);
            // Broadcast signal to other repositories
            signal({
              type: "user.created",
              repositoryId: "notification-repo",
              message: result,
            });
            return result;
          },
        };
      },
    });
    
    // Repository that listens to signals
    useRepository({
      id: "notification-repo",
      onSignal(event, repo) {
        if (event.type === "user.created") {
          console.log("New user:", event.message);
          // Send welcome email, etc.
        }
      },
      install({ instance }) {
        return {
          // repository methods...
        };
      },
    });
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

### `manager.workspaceClient<D>(config)`

Creates a workspace client with dependencies and repositories.

**Parameters:**

- `config: IWorkspaceConfig<D>`
  - `id: string` - Unique identifier for the workspace
  - `dependencies: D` - Dependencies to inject into repositories
  - `onSetup: ({ useRepository }) => void` - Setup function to register repositories
  - `logging?: boolean` - Enable/disable logging (default: `false`)

**Returns:** Object with workspace methods:

- `queryRepository` - Query repositories

**Example:**

```typescript
const { queryRepository } = manager.workspaceClient({
  id: "app",
  dependencies: {
    httpClient: myHttpClient,
    database: myDb,
  },
  onSetup({ useRepository }) {
    useRepository({
      id: "user-repo",
      install({ instance }) {
        // repository implementation
      },
    });
  },
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
    - `instance.signal` - Function to broadcast signals to other repositories
  - `onSignal?: (event, repo) => void` - Called when a signal is received
  - `onConnect?: () => void` - Called when repository is first connected
  - `onDisconnect?: () => void` - Called when repository is last disconnected
  - `middlewares?: Middleware[]` - Array of middleware functions

**Example:**

```typescript
onSetup({ useRepository }) {
  useRepository<IUserRepository>({
    id: "user-repo",
    install({ instance }): IUserRepository {
      const { dependencies, signal } = instance;
      
      return {
        async createUser(user) {
          const result = await dependencies.httpClient.post("/users", user);
          // Broadcast signal
          signal({
            type: "user.created",
            repositoryId: "notification-repo",
            message: result,
          });
          return result;
        },
      };
    },
    onSignal(event, repo) {
      console.log("Signal received:", event);
    },
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
  });
}
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

### `signal<P>(payload)`

Broadcast a signal to notify a target repository (fire-and-forget).

**Parameters:**

- `payload: ISignalPayload<P>`
  - `type: string` - Signal type identifier
  - `repositoryId: string` - Target repository identifier
  - `message?: P` - Optional payload data

**Example:**

```typescript
signal({
  type: "user.created",
  repositoryId: "notification-repo",
  message: { userId: "123", email: "user@example.com" },
});
```

### `onSignal<P>(event, repo)`

Handle incoming signals from other repositories.

**Parameters:**

- `event: ISignalSubscribePayload<P>` - Signal payload
  - `type: string` - Signal type
  - `source: string` - Source repository
  - `message: P` - Signal data
- `repo: R` - Repository instance with all methods

**Example:**

```typescript
onSignal(event, repo) {
  if (event.type === "user.created") {
    console.log("User created:", event.message);
    console.log("From repository:", event.source);
    // Call repository methods
    repo.sendEmail(event.message.email);
  }
}
```

## 🎯 Advanced Usage

### Signal Broadcasting Benefits

The built-in signal broadcasting system enables decoupled communication between repositories:

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

Repositories can communicate through the signal broadcasting system:

```typescript
const { queryRepository } = manager.workspaceClient({
  id: "app",
  dependencies: {
    httpClient: myHttpClient,
    emailService: myEmailService,
  },
  onSetup({ useRepository }) {
    // User repository broadcasts signals
    useRepository({
      id: "user-repo",
      install({ instance }) {
        const { dependencies, signal } = instance;
        return {
          async createUser(user) {
            const result = await dependencies.httpClient.post("/users", user);
            signal({
              type: "user.created",
              repositoryId: "notification-repo",
              message: result,
            });
            return result;
          },
          async deleteUser(userId) {
            await dependencies.httpClient.delete(`/users/${userId}`);
            signal({
              type: "user.deleted",
              repositoryId: "notification-repo",
              message: { userId },
            });
          },
        };
      },
    });
    
    // Notification repository listens to signals
    useRepository({
      id: "notification-repo",
      onSignal(event, repo) {
        if (event.type === "user.created") {
          repo.sendWelcomeEmail(event.message.email);
        }
        if (event.type === "user.deleted") {
          console.log("User deleted:", event.message.userId);
        }
      },
      install({ instance }) {
        const { dependencies } = instance;
        return {
          sendWelcomeEmail(email) {
            dependencies.emailService.send({
              to: email,
              subject: "Welcome!",
            });
          },
        };
      },
    });
    
    // Analytics repository also listens to signals
    useRepository({
      id: "analytics-repo",
      onSignal(event, repo) {
        if (event.type === "user.created") {
          console.log("Track new user:", event.message);
        }
      },
      install({ instance }) {
        return {
          // analytics methods...
        };
      },
    });
  },
});
```

### Multiple Workspaces

Create multiple isolated workspaces with different dependencies:

```typescript
// API workspace
const apiWorkspace = manager.workspaceClient({
  id: "api",
  dependencies: {
    httpClient: apiClient,
    cache: redisCache,
  },
  onSetup({ useRepository }) {
    // API repositories
  },
  logging: true,
});

// Database workspace
const dbWorkspace = manager.workspaceClient({
  id: "database",
  dependencies: {
    db: postgresClient,
    logger: winstonLogger,
  },
  onSetup({ useRepository }) {
    // Database repositories
  },
  logging: false,
});

// Each workspace has isolated repositories and signal broadcasters
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
const { queryRepository } = manager.workspaceClient<IDependencies>({
  id: "app",
  dependencies,
  onSetup({ useRepository }) {
    useRepository<IUserRepository>({
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
    });
  },
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

const { queryRepository } = manager.workspaceClient({
  dependencies,
  onSetup({ useRepository }) {
    useRepository({
      id: "user-repo",
      install({ instance }) {
        return {
          getUsers: () => instance.dependencies.httpClient.get("/users"),
        };
      },
      middlewares: [loggingMiddleware, cacheMiddleware],
    });
  },
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
const { queryRepository } = manager.workspaceClient({
  id: "app",
  dependencies,
  onSetup({ useRepository }) {
    // repositories here
  },
  logging: true, // Enables colored console output
});
```

## 🏗️ Design Patterns

This library implements several design patterns:

- **Dependency Injection** - Dependencies are injected into repositories
- **Factory Pattern** - Repositories are created using factory functions
- **Singleton Pattern** - Each repository is a singleton per workspace (with reference counting)
- **Repository Pattern** - Abstracts data access logic
- **Signal Broadcasting** - Fire-and-forget communication between repositories
- **Workspace Pattern** - Clean API for managing dependencies and lifecycle
- **Observer Pattern** - Repositories can broadcast and listen to signals
