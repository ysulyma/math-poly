// all the code in this repo sucks,
// but this one especially sucks
import {KTX as $} from "@liqvid/katex/plain";
import {useEffect, useRef, useState} from "react";

import type {Ring} from "../App";

const {raw} = String;

export function Negative({p}: Ring) {
  const [m, setM] = useState(12);
  const [n, setN] = useState(11);

  return (
    <>
      <p>§4 of the paper.</p>
      <VarsTable {...{m, n, setM, setN}} />
      <$>{raw`\mathrm W\Omega^0`}</$>
      <$>
        {"\\" +
          raw`xymatrix{
            W\Omega^0
          }`}
      </$>
    </>
  );
}

type Config = {m: number; n: number};

function VarsTable({
  m,
  n,
  setM,
  setN,
}: Config & {setM: (m: number) => void; setN: (n: number) => void}) {
  const onChangeM = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(evt.currentTarget.value);

    if (!Number.isNaN(value)) {
      setM(value);
    }
  };

  const onChangeN = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(evt.currentTarget.value);

    if (!Number.isNaN(value)) {
      setN(value);
    }
  };

  return (
    <fieldset>
      <table>
        <tbody>
          <tr>
            <td>
              <$>m</$>
            </td>
            <td>
              <input
                onChange={onChangeM}
                type="number"
                min={n + 1}
                max={20}
                step={1}
                value={m}
              />
            </td>
          </tr>
          <tr>
            <td>
              <$>n</$>
            </td>
            <td>
              <input
                onChange={onChangeN}
                type="number"
                min={2}
                max={m - 1}
                step={1}
                value={n}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </fieldset>
  );
}
