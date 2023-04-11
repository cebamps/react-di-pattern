import "./App.css";

import { useAppSelector } from "./app/hooks";
import { Demo } from "./app/redux-di/Demo";
import { selectReduxDiState } from "./app/redux-di/slice";

function App() {
  return (
    <div className="app">
      <h1>State dump</h1>
      <DumpState />

      <h1>Counters</h1>
      <Demo />
    </div>
  );
}

function DumpState() {
  return (
    <>
      <pre>
        <code>
          {JSON.stringify(useAppSelector(selectReduxDiState), null, 2)}
        </code>
      </pre>
    </>
  );
}

export default App;
