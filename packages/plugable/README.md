# Plugable

## Introduction:

The Plugable System is a JavaScript library that provides a flexible and extensible approach to creating objects with dynamically assignable properties and event-driven communication. It allows you to create plugable objects that can store values associated with keys and notify registered listeners when those values change. This documentation will guide you through the usage and features of the Plugable System, helping you understand how to integrate it into your JavaScript projects.

The Plugable System offers a simple and intuitive API for working with plugable objects. It provides methods for creating keys, getting and setting values, registering and managing listeners, and inheriting from existing plugable objects. By leveraging the Plugable System, you can design modular and reusable components that can be easily extended and customized.

## Key Features:

1. Plugable Objects: The core concept of the Plugable System is the plugable object. These objects act as containers for storing values associated with keys. Plugable objects can be created using the `createPlugable()` function and can inherit from other plugable objects using the `inheritPlugable()` function.

2. Key Creation: The `createKey()` function allows you to create unique keys that can be used as property keys in plugable objects. These keys ensure that values are stored and accessed consistently.

3. Value Access: The Plugable System provides two methods for accessing values stored in plugable objects. The `getThrow()` function retrieves a value associated with a key and throws an error if the value is not found. The `get()` function retrieves a value associated with a key and returns `undefined` if the value is not found.

4. Value Modification: The `set()` function enables you to set the value associated with a key in a plugable object. It automatically dispatches the new value to the registered listeners, notifying them of the change.

5. Event System: The Plugable System includes an event system that allows you to register listeners for specific keys in plugable objects. The `on()` function is used to register listeners, and they will be notified whenever the associated value changes.

6. Inheritance: Plugable objects support inheritance, allowing you to create a hierarchy of plugable objects. Inherited plugable objects retain their own listeners and values while also inheriting the values and listeners from their parent plugable objects.

By utilizing these features, you can build highly modular and flexible applications that are easily extensible and maintainable. The Plugable System provides a powerful mechanism for creating objects with dynamic properties and event-driven behavior, enabling you to implement complex and interactive systems with ease.

Next, let's delve into the installation process and the basic usage of the Plugable System.

## Installation

To get started with the Plugable System, you need to install the `@wixc3/plugable` package in your JavaScript project. The package can be installed using npm or yarn. Make sure you have Node.js and npm or yarn installed on your development machine before proceeding with the installation.

### Using npm

Open your terminal or command prompt and run the following command to install the `@wixc3/plugable` package:

```bash
npm install @wixc3/plugable
```

## Basic Usage

Now that you have the `@wixc3/plugable` package installed, you can begin working with plugable objects and utilizing the provided features.

### Creating Plugable Objects

To create a new plugable object, use the `createPlugable()` function:

```javascript
import { createPlugable } from '@wixc3/plugable';

const myPlugable = createPlugable();
```

### Creating and Using Keys

The `createKey()` function is used to create unique keys, which will be used as property keys in plugable objects:

```javascript
import { createKey } from '@wixc3/plugable';

const nameKey = createKey<string>('name');
const ageKey = createKey<number>('age');
```

You can then use these keys to set and retrieve values in your plugable object:

```javascript
myPlugable.set(nameKey, 'John Doe');
myPlugable.set(ageKey, 30);

console.log(myPlugable.get(nameKey)); // Output: "John Doe"
console.log(myPlugable.get(ageKey));  // Output: 30
```

### Registering Listeners

The Plugable System's event system allows you to register listeners for specific keys in plugable objects using the `on()` function:

```javascript
import { on } from '@wixc3/plugable';

const unsubscribe = on(myPlugable, ageKey, (newValue) => {
    console.log(`Age has been updated to: ${newValue}`);
});

myPlugable.set(ageKey, 35); // Output: "Age has been updated to: 35"

// Later, if you want to unsubscribe the listener:
unsubscribe();
```

## Advanced Usage

The `@wixc3/plugable` package provides advanced features and functionalities that enhance the flexibility and extensibility of the Plugable System. In this section, we will explore these features based on the provided tests and previous knowledge.

### Inheriting Plugable Objects

The Plugable System supports the concept of inheritance, allowing you to create child plugable objects that inherit properties and listeners from a parent plugable object. This enables hierarchical relationships and enables cascading updates.

To create a child plugable object that inherits from a parent plugable object, use the `inheritPlugable()` function:

```javascript
import { inheritPlugable } from '@wixc3/plugable';

const parent = createPlugable();
const child = inheritPlugable(parent);
```

With inheritance, changes made to the parent plugable object will propagate to the child plugable object, while changes made to the child plugable object will not affect the parent.

### Event Emission in Inherited Plugable Objects

When a key is set or updated in a parent plugable object, the event is emitted not only in the parent but also in any child plugable objects that have registered listeners for that key. This allows you to handle events and updates at different levels of the plugable hierarchy.

Consider the following example:

```javascript
import { createPlugable, createKey, inheritPlugable, set, on } from '@wixc3/plugable';

const parent = createPlugable();
const child = inheritPlugable(parent);
const key = createKey<string>();
const res = new Array<string>();

on(child, key, (value) => res.push(value));
set(parent, key, 'hello');

console.log(res); // Output: ['hello']
```

In the above example, we create a parent plugable object and a child plugable object that inherits from the parent. We then register a listener on the child for a specific key and set a value for that key in the parent. As a result, the event is emitted in the child, and the value is added to the `res` array.

### Managing Overrides in Inherited Plugable Objects

In the Plugable System, when a key is set or updated in a parent plugable object, the event is emitted to child plugable objects unless there is an override for that key in a child object. An override occurs when a child plugable object sets a different value for a key that already exists in its parent.

Let's examine how overrides are managed using the provided tests:

```javascript
import { createPlugable, createKey, inheritPlugable, set, get } from '@wixc3/plugable';

const parent = createPlugable();
const child = inheritPlugable(parent);
const key = createKey<string>();
const res = new Array<string>();

set(child, key, 'world');
on(child, key, (value) => res.push(value));
set(parent, key, 'hello');

console.log(res); // Output: []

const value = get(child, key);
console.log(value); // Output: 'world'
```

In the above example, we create a parent plugable object and a child plugable object that inherits from the parent. We set a value of `'world'` for the `key` in the child object before registering a listener on the child for that key. Then, we set a value of `'hello'` for the `key` in the parent object.

Since the child plugable object has an override for the `key`, the event emitted from the parent is not propagated to the child. Therefore, the `res` array remains empty. However, we can still access the overridden value `'world'` by directly querying the child object using `get(child, key)`.

This behavior allows you to selectively override values in child plugable objects while maintaining the inheritance of other values and event handling from the parent object.


### Custom Value Comparison

By default, the `set()` function compares the previous value with the new value using the triple equals (`===`) operator. However, you can customize the value comparison logic by passing an optional `isEqual` function as the last argument to the `set()` function. The `isEqual` function takes the previous value and the new value as arguments and returns a boolean indicating whether they are considered equal.

For example:

```javascript
import { createPlugable, createKey, set } from '@wixc3/plugable';

const myKey = createKey<number>();

// Custom value comparison function
function customValueComparison(previous: number | undefined, value: number): boolean {
  // Compare values based on divisibility by 2
  return value % 2 === 0;
}

const plugable = createPlugable();
set(plugable, myKey, 2); // Initial value

console.log(get(plugable, myKey)); // Output: 2

// Set a new value that is odd
set(plugable, myKey, 5, customValueComparison);

console.log(get(plugable, myKey)); // Output: 2 (Previous value is retained)

// Set a new value that is even
set(plugable, myKey, 6, customValueComparison);

console.log(get(plugable, myKey)); // Output: 6 (Value is updated)
```

In this simplified example, we create a custom value comparison function `customValueComparison` that checks whether a number is even. When setting a new value using the `set` function, we pass the `customValueComparison` function as the `isEqual` parameter. If the new value is even, it is considered equal to the previous value, and the update is ignored. However, if the new value is odd, it is considered different, and the update is applied.

This example demonstrates how you can define your own custom logic for determining when two values should be considered equal. It allows you to have control over state updates based on specific value comparisons, enabling you to optimize rendering and avoid unnecessary re-renders in React components.

### Summary

By managing overrides in inherited plugable objects, the Plugable System provides fine-grained control over event propagation and value inheritance. You can selectively override values in child objects, ensuring that events are emitted only to the appropriate listeners


## Strong Typing: Ensuring Type Safety and Flexible Key-Based Management

1. Key-Based Type Safety: This package leverages TypeScript's strong typing capabilities by associating values with unique keys. This ensures type safety when accessing and manipulating values within a plugable object. The use of keys enables compile-time type checking, preventing type errors and providing a reliable way to work with plugable values.

2. No Central Type: This system does not enforce a central type for the plugable object itself. This flexibility allows developers to create plugable objects with varying structures and sets of keys, tailored to their specific application requirements. Each plugable object can have its own unique set of keys, representing the specific values it manages. This approach promotes flexibility and modularity in the design of plugable systems, as different parts of the application can define their own sets of keys without being restricted to a predefined centralized structure.

## React Adapter: Managing Plugable State in React Components

The `@wixc3/plugable` package provides a React adapter that allows you to integrate plugable state management into your React components seamlessly. This section will explain the usage of the React adapter and its associated hooks: `PlugableContext`, `usePlugable`, and `usePlugableValue`. These hooks enable easy access to plugable state and provide automatic re-rendering of components when the state changes.

### PlugableContext

The `PlugableContext` is a React context that holds the reference to a plugable object. It allows child components to access the plugable state without the need for prop drilling. The `PlugableContext` should be initialized with a valid plugable object at an appropriate level in your component tree, typically in a higher-level component.

Example usage:

```javascript
import { PlugableContext, createPlugable } from '@wixc3/plugable';

const plugable = createPlugable();

function App() {
  return (
    <PlugableContext.Provider value={plugable}>
      {/* Your component hierarchy */}
    </PlugableContext.Provider>
  );
}
```

### usePlugable

The `usePlugable` hook is used to retrieve the plugable object from the `PlugableContext`. It simplifies accessing the plugable state within your React components. If the `PlugableContext` is not initialized properly, an error will be thrown.

Example usage:

```javascript
import { usePlugable } from '@wixc3/plugable';

function MyComponent() {
  const plugable = usePlugable();

  // Use the plugable state and perform operations
  // ...
}
```

### usePlugableValue

The `usePlugableValue` hook is used to access a specific value from the plugable state based on a provided key. It automatically subscribes the component to updates of that value, ensuring that the component is re-rendered whenever the value changes.

Example usage:

```javascript
import { usePlugableValue } from '@wixc3/plugable';
import { myData } from './keys';

function DisplayData() {
  const data = usePlugableValue(myData);

  return (
    <div>
      {/* Display the data */}
      {data && <p>{data}</p>}
    </div>
  );
}
```

In the above example, the `DisplayData` component utilizes the `usePlugableValue` hook to access the value associated with the key `myData` from the plugable state. The component automatically re-renders whenever the value of `myData` changes, reflecting the updated data in the UI.


By leveraging the React adapter and the provided hooks, you can easily manage plugable state within your React components, enabling efficient and reactive data flow.

## Benefits of Using PlugableContext for React State Management

Using the `PlugableContext` as the context for React provides several benefits:

1. **Centralized State Management**: The `PlugableContext` allows you to centralize your state management logic in a single context, making it easier to manage and access state across different components without the need for prop drilling.

2. **Component Decoupling**: With the `PlugableContext`, components can access the shared state without directly depending on each other. This decoupling improves the modularity and reusability of components, as they can rely on the context to provide the necessary data and functionality.

3. **Dynamic Updates**: The plugable state stored in the `PlugableContext` can be dynamically updated, and any component subscribed to the context will automatically receive the updated values. This enables real-time data propagation and ensures that components stay in sync with the latest state changes.

4. **Child Context Override**: The `PlugableContext` supports the concept of child context override, where you can create a new `Plugable` object that inherits from the parent `Plugable` and overrides specific values or adds new values. This allows you to customize the state for specific parts of your component tree while maintaining the overall state management structure provided by the parent context.

5. **Flexible and Scalable Architecture**: The `PlugableContext` pattern allows you to build a flexible and scalable architecture for your React application. It supports composition and inheritance of plugable objects, enabling you to create complex state hierarchies and manage state at different levels of your component tree.

6. **Efficient Rerendering**: The `usePlugable` and `usePlugableValue` hooks provided by the `@wixc3/plugable` package are optimized to only rerender components when the relevant state they depend on changes. This helps to improve performance by avoiding unnecessary rerenders in components that are not affected by state updates.

By leveraging the `PlugableContext` in your React application, you can benefit from centralized state management, component decoupling, dynamic updates, child context override, and a scalable architecture that promotes reusability and maintainability.
