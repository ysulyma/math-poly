import { KTX as $ } from "@liqvid/katex";
import { Tabs } from "radix-ui";
import type { JSX } from "react";

import { TR } from "./tabs/TR.tsx";

import "./styles.css";

import { type MathJax3Config, MathJaxContext } from "better-react-mathjax";

// tabs
interface TabData {
  key: string;
  title: React.ReactNode;
  component: () => JSX.Element;
}
const tabs: TabData[] = [
  {
    component: TR,
    key: "tr",
    title: (
      <>
        <$>{String.raw`\mathrm{TR}_\bigstar`}</$>
      </>
    ),
  },
];

const mathjaxConfig = {
  loader: {
    load: [
      "[custom]/xypic.js",
      "[tex]/color.js",
      "[tex]/html.js",
      "[tex]/configmacros.js",
      "[tex]/ams.js",
      "output/svg",
    ],
    paths: {
      custom: "https://cdn.jsdelivr.net/gh/sonoisa/XyJax-v3@3.0.1/build/",
    },
  },
  options: {
    enableMenu: false,
  },
  startup: {
    typeset: false, // don't perform initial typeset
  },
  tex: {
    macros: {
      dRW: [String.raw`\mathrm W_{#1}\Omega`, 1, ""],
      fade: [String.raw`\textcolor{lightgray}{#1}`, 1],
    },
    packages: { "[+]": ["color", "html", "ams", "xypic"] },
  },
} satisfies MathJax3Config;

export default function App() {
  return (
    <MathJaxContext config={mathjaxConfig} hideUntilTypeset="every" version={3}>
      <div className="App">
        <p>
          These are interactive widgets to explore the results/figures in my
          (forthcoming) paper{" "}
          <cite>
            <$>{"\\mathrm{RO}(G)"}</$>-graded norms for prismatic and de
            Rham-Witt forms
          </cite>
          . The source code is available{" "}
          <a
            href="https://github.com/ysulyma/math-poly"
            rel="noreferrer"
            target="_blank"
          >
            on GitHub
          </a>
          .
        </p>
        {/* see https://www.radix-ui.com/docs/primitives/components/tabs */}
        <Tabs.Root className="TabsRoot" defaultValue="tr">
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
                <Component />
              </Tabs.Content>
            );
          })}
        </Tabs.Root>
      </div>
    </MathJaxContext>
  );
}
