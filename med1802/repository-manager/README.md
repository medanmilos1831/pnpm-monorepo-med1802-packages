# 🔄 Repository Manager

A lightweight, type-safe repository manager with dependency injection, event-driven architecture, lifecycle management, and multi-workspace support for TypeScript/JavaScript applications.

## ✨ Features

- ✅ **Dependency Injection** - Inject infrastructure dependencies into repositories
- ✅ **Event-Driven Architecture** - Built-in observer pattern for inter-repository communication
- ✅ **Lifecycle Management** - Automatic connection/disconnection with reference counting
- ✅ **Multi-Workspace Support** - Manage multiple isolated workspaces with different dependencies
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Lazy Initialization** - Repository instances are created only when needed
- ✅ **Workspace Pattern** - Clean API with `createWorkspace`
- ✅ **Logging** - Built-in logging with colored console output
- ✅ **Memory Efficient** - Automatic cleanup when no connections remain
- ✅ **Middleware Support** - Intercept and modify repository method calls
- ✅ **Scoped Observer** - Hierarchical event system for organized communication

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
const { defineRepository, queryRepository } = manager.createWorkspace({
  id: "app",
  logging: true,
  infrastructure,
});

// Define repository
defineRepository<IUserRepository>({
  id: "user-repo",
  install({ instance }) {
    const { infrastructure, observer } = instance;
    return {
      async getUsers() {
        return infrastructure.httpClient.get("/api/users");
      },
      async createUser(user) {
        const result = await infrastructure.httpClient.post("/api/users", user);
        // Notify other repositories about new user
        observer.dispatch({
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
  infrastructure,
  logging: true
});
workspace.defineRepository({...});                      // Define repositories
workspace.queryRepository("repo-id");                   // Query repositories
```

### 2. Workspace Pattern

Workspace is the **entry point** for all operations. It encapsulates:

- Infrastructure dependencies
- Repository definitions
- Observer system for events
- Logging configuration

```typescript
const { defineRepository, queryRepository } = manager.createWorkspace({
  id: "app-workspace",
  logging: true,
  infrastructure: {
    httpClient: myHttpClient,
    cache: myCache,
  },
});
```

### 3. Observer System

The built-in observer enables **event-driven inter-repository communication**:

```typescript
// Define repository that dispatches events
defineRepository({
  id: "user-repo",
  install({ instance }) {
    const { observer } = instance;
    return {
      async createUser(user) {
        const result = await saveUser(user);
        // Notify other repositories
        observer.dispatch({
          type: "user.created",
          repositoryId: "user-repo",
          message: result,
        });
        return result;
      },
    };
  },
});

// Another repository can subscribe to these events
defineRepository({
  id: "notification-repo",
  install({ instance }) {
    const { observer } = instance;
    
    // Subscribe to user events
    observer.subscribe((payload) => {
      if (payload.type === "user.created") {
        console.log("New user:", payload.message);
        // Send welcome email, etc.
      }
    });
    
    return {
      // repository methods...
    };
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

### `manager.createWorkspace<I>(config)`

Creates a workspace with infrastructure dependencies.

**Parameters:**

- `config: IConfiguration<I>`
  - `id: string` - Unique identifier for the workspace
  - `infrastructure: I` - Infrastructure dependencies to inject into repositories
  - `logging?: boolean` - Enable/disable logging (default: `false`)

**Returns:** Object with workspace methods:

- `defineRepository` - Define repositories
- `queryRepository` - Query repositories

**Example:**

```typescript
const { defineRepository, queryRepository } = manager.createWorkspace({
  id: "app",
  infrastructure: {
    httpClient: myHttpClient,
    database: myDb,
  },
  logging: true,
});
```

### `defineRepository<R>(config)`

Defines a repository within the workspace.

**Parameters:**

- `config: IRepositoryPlugin<I, R>`
  - `id: string` - Unique identifier for the repository
  - `install: ({ instance }) => R` - Factory function that returns repository instance
    - `instance.infrastructure` - Injected infrastructure
    - `instance.observer` - Observer for event-driven communication
  - `onConnect?: () => void` - Called when repository is first connected
  - `onDisconnect?: () => void` - Called when repository is last disconnected
  - `middlewares?: Middleware[]` - Array of middleware functions

**Example:**

```typescript
defineRepository<IUserRepository>({
  id: "user-repo",
  install({ instance }) {
    const { infrastructure, observer } = instance;
    
    // Subscribe to events
    observer.subscribe((payload) => {
      console.log("Event received:", payload);
    });
    
    return {
      async createUser(user) {
        const result = await infrastructure.httpClient.post("/users", user);
        // Dispatch event
        observer.dispatch({
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

### `observer.dispatch<P>(payload)`

Dispatch an event to notify other repositories.

**Parameters:**

- `payload: IObserverDispatch<P>`
  - `type: string` - Event type identifier
  - `repositoryId: string` - Source repository identifier
  - `message?: P` - Optional payload data

**Example:**

```typescript
observer.dispatch({
  type: "user.created",
  repositoryId: "user-repo",
  message: { userId: "123", email: "user@example.com" },
});
```

### `observer.subscribe<P>(callback)`

Subscribe to events from other repositories.

**Parameters:**

- `callback: (payload: IObserverSubscribePayload<P>) => void` - Callback function
  - `payload.type: string` - Event type
  - `payload.source: string` - Source repository
  - `payload.message: P` - Event payload

**Example:**

```typescript
observer.subscribe((payload) => {
  if (payload.type === "user.created") {
    console.log("User created:", payload.message);
    console.log("From repository:", payload.source);
  }
});
```

## 🎯 Advanced Usage

### Observer System Benefits

The built-in observer system enables decoupled communication between repositories:

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

Repositories can communicate through the observer system:

```typescript
// User repository dispatches events
defineRepository({
  id: "user-repo",
  install({ instance }) {
    const { infrastructure, observer } = instance;
    return {
      async createUser(user) {
        const result = await infrastructure.httpClient.post("/users", user);
        observer.dispatch({
          type: "user.created",
          repositoryId: "user-repo",
          message: result,
        });
        return result;
      },
      async deleteUser(userId) {
        await infrastructure.httpClient.delete(`/users/${userId}`);
        observer.dispatch({
          type: "user.deleted",
          repositoryId: "user-repo",
          message: { userId },
        });
      },
    };
  },
});

// Notification repository subscribes to user events
defineRepository({
  id: "notification-repo",
  install({ instance }) {
    const { observer, infrastructure } = instance;
    
    observer.subscribe((payload) => {
      if (payload.type === "user.created") {
        infrastructure.emailService.send({
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
});

// Analytics repository also subscribes
defineRepository({
  id: "analytics-repo",
  install({ instance }) {
    const { observer } = instance;
    
    observer.subscribe((payload) => {
      if (payload.type === "user.created") {
        console.log("Track new user:", payload.message);
      }
    });
    
    return {
      // analytics methods...
    };
  },
});
```

### Multiple Workspaces

Create multiple isolated workspaces with different dependencies:

```typescript
// API workspace
const apiWorkspace = manager.createWorkspace({
  id: "api",
  infrastructure: {
    httpClient: apiClient,
    cache: redisCache,
  },
  logging: true,
});

// Database workspace
const dbWorkspace = manager.createWorkspace({
  id: "database",
  infrastructure: {
    db: postgresClient,
    logger: winstonLogger,
  },
  logging: false,
});

// Each workspace has isolated repositories and observers
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
  manager.createWorkspace<IInfrastructure>({
    id: "app",
    infrastructure,
    logging: true,
  });

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

### Real-World Example: E-Commerce System

```typescript
// Infrastructure
const infrastructure = {
  httpClient: {
    get: async (url) => fetch(url).then((r) => r.json()),
    post: async (url, data) =>
      fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  },
  emailService: {
    send: async (email) => console.log("Sending email:", email),
  },
  cache: new Map(),
};

// Create workspace
const { defineRepository, queryRepository } = manager.createWorkspace({
  id: "ecommerce",
  infrastructure,
  logging: true,
});

// Order repository
defineRepository({
  id: "order-repo",
  install({ instance }) {
    const { infrastructure, observer } = instance;
    return {
      async createOrder(order) {
        const result = await infrastructure.httpClient.post("/api/orders", order);
        
        // Notify other systems
        observer.dispatch({
          type: "order.created",
          repositoryId: "order-repo",
          message: result,
        });
        
        return result;
      },
      async cancelOrder(orderId) {
        await infrastructure.httpClient.post(`/api/orders/${orderId}/cancel`);
        
        observer.dispatch({
          type: "order.cancelled",
          repositoryId: "order-repo",
          message: { orderId },
        });
      },
    };
  },
  onConnect: () => console.log("Order repo connected"),
  onDisconnect: () => console.log("Order repo disconnected"),
});

// Inventory repository (listens to order events)
defineRepository({
  id: "inventory-repo",
  install({ instance }) {
    const { infrastructure, observer } = instance;
    
    observer.subscribe((payload) => {
      if (payload.type === "order.created") {
        console.log("Reducing inventory for order:", payload.message.id);
        // Reduce stock levels
      }
      if (payload.type === "order.cancelled") {
        console.log("Restoring inventory for order:", payload.message.orderId);
        // Restore stock levels
      }
    });
    
    return {
      checkStock: async (productId) => {
        return infrastructure.httpClient.get(`/api/inventory/${productId}`);
      },
    };
  },
});

// Email notification repository (listens to order events)
defineRepository({
  id: "email-repo",
  install({ instance }) {
    const { infrastructure, observer } = instance;
    
    observer.subscribe((payload) => {
      if (payload.type === "order.created") {
        infrastructure.emailService.send({
          to: payload.message.customerEmail,
          subject: "Order Confirmation",
          body: `Your order ${payload.message.id} has been received!`,
        });
      }
      if (payload.type === "order.cancelled") {
        infrastructure.emailService.send({
          to: payload.message.customerEmail,
          subject: "Order Cancelled",
          body: `Your order ${payload.message.orderId} has been cancelled.`,
        });
      }
    });
    
    return {
      // email methods...
    };
  },
});

// Use the system
const { repository: orderRepo, disconnect } = queryRepository("order-repo");

await orderRepo.createOrder({
  id: "ORD-123",
  items: [{ productId: "PROD-1", quantity: 2 }],
  customerEmail: "customer@example.com",
});
// This automatically:
// - Reduces inventory (inventory-repo listener)
// - Sends confirmation email (email-repo listener)

disconnect();
```

### Logging

Enable logging to see connection lifecycle and events:

```typescript
const { defineRepository } = manager.createWorkspace({
  id: "app",
  infrastructure,
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
- **Observer Pattern** - Event-driven communication between repositories
- **Workspace Pattern** - Clean API for managing dependencies and lifecycle
- **Pub/Sub Pattern** - Repositories can publish and subscribe to events

## ⚠️ Error Handling

```typescript
// Repository not found
try {
  const { repository } = queryRepository("non-existent-repo");
} catch (error) {
  console.error(error.message); // Repository "non-existent-repo" not found
}

// Observer error handling
defineRepository({
  id: "user-repo",
  install({ instance }) {
    const { observer } = instance;
    
    observer.subscribe((payload) => {
      try {
        if (payload.type === "user.created") {
          // Handle event
          processUser(payload.message);
        }
      } catch (error) {
        console.error("Event handling error:", error);
      }
    });
    
    return {
      // repository methods...
    };
  },
});
```
