import { mkCounter } from "./mkCounter";
import {
  decrementA,
  decrementB,
  incrementA,
  incrementB,
  selectACount,
  selectBCount,
} from "./slice";

export function Demo() {
  return (
    <>
      <CounterA name="A" />
      <CounterB name="B" />
    </>
  );
}

const CounterA = mkCounter({
  selectValue: selectACount,
  increment: incrementA,
  decrement: decrementA,
});

const CounterB = mkCounter({
  selectValue: selectBCount,
  increment: incrementB,
  decrement: decrementB,
});
