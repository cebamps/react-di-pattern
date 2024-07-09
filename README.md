# Static dependency injection pattern for React components

This repository demonstrates a dependency injection (<dfn>DI</dfn>) pattern that is neither original nor ground-breaking, but that I still find interesting.

## Motivation

We start with a collection of components that collaborate to create a user interface feature, which we call F.
The components that make up F were not designed for re-use because F only exists in one place in the broader app.

Then, a change of requirements makes it so that F needs to exist in multiple parts of the app.

## Example and scope

The example in this repository illustrates the problem and its solution in a specific scope.
Namely, we start with a feature F that is connected to a Redux store: it subscribes to the store to obtain data, and produces state updates through dispatched actions.

This is interesting, because the Redux connection makes the feature coupled with the rest of our app in a special way.
Unlike your regular component subtree that exclusively communicates with parent components through props at the root of the subtree, here the coupling with the Redux store permeates through the tree.
In particular, we cannot take a copy of that subtree and graft it somewhere else and expect the two copies to be independent: they both connect to the same part of the store, and therefore share the same state.

One way to remedy that is to refactor feature F to stop explicitly connecting to the Redux store, and use prop drilling instead to pass down the state values and update callbacks.
But if our feature F is large enough, refactoring to such a prop-driven component could be costly.
In the process, we might also miss out on [the performant re-rendering][react-redux-history] provided by React Redux.

Instead, we will keep the Redux connection as-is, and take inspiration from dependency injection (DI) to parameterize it, construct two copies of feature F that connect to independent parts of the Redux store.

In this repository, we keep things simple: our feature F is the classic counter component, connected to Redux state.

[react-redux-history]: https://blog.isquaredsoftware.com/2018/11/react-redux-history-implementation/

### Demo

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&logo=codesandbox)](https://githubbox.com/cebamps/react-di-pattern)

The demo may be run by using the following shell command:

```sh
yarn && yarn start
```

## The pattern in short

Starting with this component:

```jsx
import { increment, decrement } from "actions"
function Buttons() {
    const dispatch = useDispatch();
    return <>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
    </>
}
```

identify the dependencies you want to inject and turn them into an extra layer of function call, which receives those injected values in what we call a <dfn>DI context</dfn> ([`mkButtons.tsx`](src/app/redux-di/mkButtons.tsx)):

```jsx
function mkButtons(ctx) {
  return function Buttons() {
    const dispatch = useDispatch();
    return <>
      <button onClick={() => dispatch(ctx.increment())}>+1</button>
      <button onClick={() => dispatch(ctx.decrement())}>-1</button>
    </>
  }
}
```

To compose the pattern, gain access to the `Buttons` component by passing the DI context down to `mkButtons` ([`mkCounter.tsx`](src/app/redux-di/mkCounter.tsx)):

```jsx
function mkCounter(ctx) {
  const Buttons = mkButtons(ctx);

  return function Counter({ name }) {
    const value = useSelector(ctx.selectValue);
    return <div>
      {`Counter ${name} has value ${value}. `}
      <Buttons />
    </div>
  }
}
```

Now we can create as many versions of `Counter` as we need for our app, passing different values for `ctx` to inject different functionality ([`Demo.tsx`](src/app/redux-di/Demo.tsx)).

## Giving credit where credit is due

I can't imagine this is such a rare pattern, but I have had trouble finding it elsewhere.

The main author I can credit is [Madeline Trotter], in [purescript-react-basic-hooks], where you will find this exact same pattern, except that no dependency is injected.[^1]

[^1]:
    To be more precise: the `react-basic-hooks` equivalent to our `mkCounter` has an [`Effect (MyProps -> JSX)` type][react-basic-hooks-component-api], which would correspond to the TypeScript `() => React.FC<MyProps>` type.
    The `react-basic` packages consider the creation of a component function (`MyProps -> JSX`) to have side effects, and tracks that fact by wrapping the component function in the `Effect` type.
    
    From there, the idiomatic step that approximately recovers our DI pattern is to use the `ReaderT` monad transformer, as illustrated in [purescript-react-basic-hooks issue #41][react-basic-hooks#41].

[Madeline Trotter]: https://github.com/megamaddu
[purescript-react-basic-hooks]: https://github.com/megamaddu/purescript-react-basic-hooks
[react-basic-hooks#41]: https://github.com/megamaddu/purescript-react-basic-hooks/issues/41#issuecomment-775332992
[react-basic-hooks-component-api]: https://pursuit.purescript.org/packages/purescript-react-basic-hooks/8.1.2/docs/React.Basic.Hooks#t:Component

Aside from PureScript, this kind of static DI pattern is found in [redux-toolkit]'s `createSlice` or [rtk-query]'s `createApi`, which both take configuration and create React hooks (among other things).
I would not be surprised to see other libraries do the same with React components!

[redux-toolkit]: https://redux-toolkit.js.org/
[rtk-query]: https://redux-toolkit.js.org/rtk-query/overview

Other places where this pattern pops up:

- In some writings from Eric Elliott: [ericelliott/react-pure-component-starter], "[JSX Looks Like An Abomination][elliott-jsx-abomination]", in a different context (historical and practical). ([see also](https://stackoverflow.com/questions/45993746/factory-functions-for-react-components))
- In this blog post from Jack Hsu: "[The Reader monad and read-only context - A functional approach to building React applications][hsu-functional-react]".
  The pattern is hidden behind some additional functional abstraction, but it's there.

[ericelliott/react-pure-component-starter]: https://github.com/ericelliott/react-pure-component-starter
[elliott-jsx-abomination]: https://medium.com/javascript-scene/jsx-looks-like-an-abomination-1c1ec351a918
[hsu-functional-react]: https://jaysoo.ca/2017/05/10/learn-fp-with-react-part-2/

## Alternatives, pros and cons

Another candidate pattern to solve the same problem is to pass down dependencies as props, or through the React context API.

The approach presented here has a few advantages, however:

Because the injected dependencies are static, we can fearlessly inject React hooks without violating the rule of hooks.
Indeed, a hook is injected once, when creating the component that uses it.
The same component therefore always uses the same hook.
On the other hand, if we imagine passing a hook through React context or props, there is no guarantee that the hook will not change over time. In fact the primary design intent of props and context is to pass values that can change from one render to the next.
Therefore, passing a hook as a prop is a definite anti-pattern: [the React docs have a paragraph](https://react.dev/reference/rules/react-calls-components-and-hooks#never-pass-around-hooks-as-regular-values) cautioning to "never pass around Hooks as regular values".

Moreover, compared to the React context API in particular, the consumer and provider of the DI context are explicitly linked.
In contrast, React context providers and consumers are linked in a way that is dependent on the runtime component hierarchy, which makes this link looser and more inscrutable.

Still comparing to React context, the proposed pattern also does not require us to define a default value for the DI context.

Finally, this pattern applies not only to React components, but also utilities, Redux selectors, or anything else that might depend on context.
In contrast, React context may only be accessed directly by React components and custom hooks.

Some downsides and limitations are:

- This is a relatively unusual pattern, and a new concept to learn.

- Different parents of the same child component will create their own versions of the child, which can be counter-intuitive.
  In React, function components that are not equal by reference (that is, according to the `===` operator) are considered different for the purpose of tracking state (see "[Different components at the same position reset state](https://react.dev/learn/preserving-and-resetting-state#different-components-at-the-same-position-reset-state)").
  With our DI pattern, every call to `mkButtons` creates a new `Buttons` component that is different from the others.
  This should be fine most of the time, but it is still something to be aware of.

- The fact that context is injected once means we cannot inject values that change over time. In our example, injecting a Redux selector works, but injecting an actual state value would not.
  This limitation can be considered a feature -- see the next point about hooks.

- There is a bit of boilerplate.
  However, this is not as bad as prop drilling: with this DI pattern there is a clear separation between DI context and component props, both in lifecycle (the component is created at one time and mounted at another time) and in location (the context and props are clearly separated in code).
  In contrast, prop drilling tends to tangle the two concepts together into a single props type, and every level of nesting would find us mixing context with regular props when rendering a child component, only to separate them again in the child's render function.

## What is this pattern anyway?

This is known in the pure functional world as the Reader monad.

Roughly speaking, a monad is a data type which obeys certain composition rules and wraps values in some sense.

Here, our Reader wraps a value into a function: we need to give that function a DI context to get the value out.

The composition rule is illustrated in our short example above, where we observe the Reader `mkCounter` being composed into `mkButtons`.

- `mkCounter` wants to gain access to a `Buttons` component to produce its own `Counter` component.
- `mkButtons` can produce such a `Buttons` component, but it needs a DI context to do so.

The composition rule falls out quite naturally: when called, `mkCounter` simply passes into `mkButtons` the DI context it has itself received, and thereby gains access to `Buttons`.

In PureScript, this composition would be hidden behind special syntax ([`do`-notation][do-notation]).
It would look something like this:

```purs
mkCounter = do
  -- composition magic happens here
  Buttons <- mkButtons

  component "Counter" \_ -> React.do
    -- render code goes here
```

[do-notation]: https://en.wikipedia.org/w/index.php?title=Monad_(functional_programming)&oldid=1143728441#Syntactic_sugar_do-notation

## Other references

This LogRocket blog post proposes DI through props or context: https://x.com/garybernhardt/status/1006983057138741248

"A distressing amount of the history of programming is about ways to avoid passing the first argument around explicitly." -- [Gary Barnhardt](https://x.com/garybernhardt/status/1006983057138741248)

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.

The rest of this repository is licensed under the [0BSD license](./LICENSE-0BSD.txt).
