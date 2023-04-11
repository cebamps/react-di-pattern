import "./Counter.css";

import { useAppSelector } from "../hooks";
import { mkButtons } from "./mkButtons";
import { DiContext } from "./types";

export function mkCounter(ctx: DiContext) {
  const Buttons = mkButtons(ctx);
  const { selectValue } = ctx;

  return function Parent(props: { name: string }) {
    const value = useAppSelector(selectValue);
    return (
      <div className="counter">
        <div className="counter__label">
          {`Counter ${props.name} has value ${value}`}
        </div>
        <div className="counter__buttons">
          <Buttons />
        </div>
      </div>
    );
  };
}
