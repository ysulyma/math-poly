import { KTX as $ } from "@liqvid/katex/plain";
// import {MJX} from "@liqvid/mathjax/plain";
import { Tabs } from "radix-ui";
import type { JSX } from "react";

import { TR } from "./tabs/TR";

import "./styles.css";

// tabs
interface TabData {
	key: string;
	title: React.ReactNode;
	component: () => JSX.Element;
}
const tabs: TabData[] = [
	{
		key: "tr",
		title: <>TR</>,
		component: TR,
	},
];

export default function App() {
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
	);
}
