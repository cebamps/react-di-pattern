import { useDispatch } from "react-redux";

import { DiContext } from "./types";

export function mkButtons({ increment, decrement }: DiContext) {
  return function Buttons() {
    const dispatch = useDispatch();
    return (
      <>
        <button onClick={() => dispatch(increment())}>+1</button>
        <button onClick={() => dispatch(decrement())}>-1</button>
      </>
    );
  };
}
