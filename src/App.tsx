import {KTX as $} from "@liqvid/katex/plain";
// import {MJX} from "@liqvid/mathjax/plain";
import {Tabs} from "radix-ui";
import {useReducer} from "react";

import {Negative} from "./tabs/Negative";

import "./styles.css";
import classNames from "classnames";

// for LaTeX
const {raw} = String;

// tabs
interface TabData {
  key: string;
  title: React.ReactNode;
  component: (props: Ring) => JSX.Element;
}
const tabs: TabData[] = [
  {
    key: "negative",
    title: <>Negative range</>,
    component: Negative,
  },
];

/** Which ring we're calculating for */
export interface Ring {
  /** Prime */
  p: number;

  base: "k" | "R" | "O_C";
}

type Action = Partial<Ring>;

function reducer(state: Ring, action: Action): Ring {
  return {...state, ...action};
}

const initialState: Ring = {
  p: 2,
  base: "k",
};

// pretty sure this is all of them
const primes = [2, 3, 5];

export default function App() {
  const [ring, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="App">
      <p>
        These are interactive widgets to explore the results/figures in my
        (forthcoming) paper{" "}
        <cite>
          <$>{"\\mathrm{RO}(G)"}</$>-graded norms for prismatic and de Rham-Witt
          theory
        </cite>
        . The source code is available{" "}
        <a
          href="https://github.com/ysulyma/math-poly"
          target="_blank"
          rel="noreferrer"
        >
          on GitHub
        </a>
        .
      </p>
      <fieldset>
        <VarsTable {...ring} dispatch={dispatch} />
      </fieldset>
      {/* see https://www.radix-ui.com/docs/primitives/components/tabs */}
      <Tabs.Root className="TabsRoot" defaultValue="negative">
        <Tabs.List className="TabsList">
          {tabs.map((t) => (
            <Tabs.Trigger className="TabsTrigger" key={t.key} value={t.key}>
              {t.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {tabs.map((t) => {
          // components need to have a capital variable name
          const Component = t.component;

          return (
            <Tabs.Content
              className="TabsContent"
              forceMount
              key={t.key}
              value={t.key}
            >
              <Component {...ring} />
            </Tabs.Content>
          );
        })}
      </Tabs.Root>
    </div>
  );
}

function VarsTable({
  base,
  p,
  dispatch,
}: Ring & {
  dispatch: React.Dispatch<Action>;
}) {
  const setP = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({p: Number.parseInt(evt.currentTarget.value)});
  };

  const setBase = (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({base: evt.currentTarget.value});
  };

  const Th = (props: React.ComponentProps<"th">) => (
    <th className="rounded-t-md bg-gray-200 px-2 py-1" {...props} />
  );
  const Td = ({className, ...props}: React.ComponentProps<"td">) => (
    <td
      className={classNames("rounded-t-md px-2 py-1", className)}
      {...props}
    />
  );

  return (
    <div className="rounded-md overflow-hidden border border-solid border-stone-400 w-fit mx-auto my-2">
      <table>
        <thead>
          <tr>
            <Th>
              <$>p</$>
            </Th>
            <Th>Base</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td className="px-8">
              <select value={p} onChange={setP}>
                {primes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Td>
            <Td className="text-left">
              <ul className="list-none">
                <li>
                  <input id="base-k" name="base" type="radio" value="k" />{" "}
                  <label htmlFor="base-k">
                    <$>k</$> (perfect <$>\mathbb F_p</$>-algebra)
                  </label>
                </li>
                <li>
                  <input id="base-R" name="base" type="radio" value="R" />{" "}
                  <label htmlFor="base-R">
                    <$>R</$> (<$>p</$>-torsionfree)
                  </label>
                </li>
                <li>
                  <input id="base-O_C" name="base" type="radio" value="O_C" />{" "}
                  <label htmlFor="base-O_C">
                    <$>\mathcal O_C</$> (spherically complete)
                  </label>
                </li>
              </ul>
            </Td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
