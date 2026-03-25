import { KaTeXProvider, KTX, parseMacros } from "@liqvid/katex";
import { MJX } from "@liqvid/mathjax/plain";
import { constrain, range } from "@liqvid/utils";
import { useCallback, useEffect, useState } from "react";
import { macros } from "../macros";
import { fmt } from "../utils";

/** Configuration for the TR interface */
export interface TRConfig {
	/** The non-negative integer n */
	n: number;

	/** The n+1 integer coefficients */
	alpha: number[];

	/** Ring type selection */
	ringType: "char-p" | "torsion-free";

	/** Spectral sequence range (0 to n+1) */
	page: number;

	/** whether to simplify expressions */
	simplified: boolean;
}

/**
 * Dummy function that takes TR configuration and renders MathJax.
 * Fill in the implementation to render the actual math content.
 */
export function renderTRMathJax(config: TRConfig): void {
	const container = document.getElementById("tr-mathjax-output");
	if (!container) return;

	// Example LaTeX that uses the configuration
	// Replace this with your actual implementation
	const { n, alpha, ringType, page } = config;

	const coeffStr = alpha
		.map((c: number, i: number) => `a_{${i}} = ${c}`)
		.join(", ");
	const ringTypeStr =
		ringType === "char-p"
			? "\\text{characteristic } p"
			: "\\text{torsion-free perfectoid}";

	const latex = `
    \\begin{align*}
    n &= ${n} \\\\
    \\text{Coefficients: } & ${coeffStr} \\\\
    \\text{Ring type: } & ${ringTypeStr} \\\\
    \\text{Page } & ${page}
    \\end{align*}
  `;

	container.innerHTML = `\\[${latex}\\]`;

	// Typeset with MathJax if available
	if (window.MathJax?.typesetPromise) {
		window.MathJax.typesetPromise([container]);
	}
}

export function TR() {
	const [n, setN] = useState(1);
	const [alpha, setCoefficients] = useState<number[]>([1, 2]);
	const [ringType, setRingType] =
		useState<TRConfig["ringType"]>("torsion-free");
	const [page, setSpectralSequenceRange] = useState(0);
	const [simplified, setSimplified] = useState(false);

	// Update coefficients array when n changes
	useEffect(() => {
		setCoefficients((prev) => {
			const newCoeffs = new Array(n + 1).fill(0);
			// Preserve existing values where possible
			for (let i = 0; i <= Math.min(n, prev.length - 1); i++) {
				newCoeffs[i] = prev[i];
			}
			return newCoeffs;
		});
		// Clamp spectral sequence range to valid range
		setSpectralSequenceRange((prev) => Math.min(prev, n + 1));
	}, [n]);

	const handleNChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Math.max(0, e.target.valueAsNumber || 0);
			setN(value);
		},
		[],
	);

	const handleCoefficientChange = useCallback(
		(index: number, value: number) => {
			setCoefficients((prev) => {
				const newCoeffs = [...prev];
				newCoeffs[index] = value;
				return newCoeffs;
			});
		},
		[],
	);

	const handleRingTypeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setRingType(e.target.value as TRConfig["ringType"]);
		},
		[],
	);

	const handleSpectralSequenceChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSpectralSequenceRange(e.target.valueAsNumber || 0);
		},
		[],
	);

	const handleSimplifiedChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSimplified(e.target.checked);
		},
		[],
	);

	// Trigger MathJax render when config changes
	const config: TRConfig = {
		n,
		alpha,
		ringType,
		page,
		simplified,
	};

	const ctgs = getContiguousBounds(alpha);

	return (
		<KaTeXProvider macros={parseMacros(macros)}>
			<div className="flex flex-col gap-6">
				{/* n input */}
				<div className="flex items-center gap-4">
					<label htmlFor="tr-n-input">
						<KTX>n</KTX>
					</label>
					<input
						id="tr-n-input"
						type="number"
						min={0}
						value={n}
						onChange={handleNChange}
						className="w-20 p-2 border border-gray-300 rounded"
					/>
				</div>

				{/* Coefficients table */}
				<div className="overflow-x-auto flex items-start gap-4">
					<KTX>\alpha</KTX>
					<table className="border-collapse">
						<tbody>
							<tr>
								{alpha.map((coeff, i) => (
									<td key={i} className="p-1 text-center">
										<input
											type="number"
											value={coeff}
											onChange={(e) =>
												handleCoefficientChange(i, e.target.valueAsNumber || 0)
											}
											className="w-15 p-2 border border-gray-300 rounded text-xl! text-center"
										/>
									</td>
								))}
							</tr>
							<tr className="text-gray-500 text-sm">
								{alpha.map((_, i) => (
									<td key={i} className="pt-2 text-center">
										{i}
									</td>
								))}
							</tr>
						</tbody>
					</table>
					{ctgs.success && (
						<KTX className="text-gray-400 mt-2">{raw`k = ${ctgs.k}, \quad \ell = ${ctgs.l}`}</KTX>
					)}
				</div>

				{/* Ring type selection */}
				<div className="flex items-center gap-6 flex-wrap">
					<span>
						<strong>Ring type:</strong>
					</span>
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name="ring-type"
							value="char-p"
							checked={ringType === "char-p"}
							onChange={handleRingTypeChange}
							className="cursor-pointer"
						/>
						characteristic <em>p</em>
					</label>
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name="ring-type"
							value="torsion-free"
							checked={ringType === "torsion-free"}
							onChange={handleRingTypeChange}
							className="cursor-pointer"
						/>
						torsion-free perfectoid
					</label>
				</div>

				{/* Spectral sequence range slider */}
				<div className="flex items-center gap-4 flex-wrap">
					<label htmlFor="tr-spectral-range">
						<strong>Spectral sequence page:</strong>
					</label>
					<input
						id="tr-spectral-range"
						type="range"
						min={0}
						max={n + 1}
						value={page}
						onChange={handleSpectralSequenceChange}
						className="w-50 cursor-pointer"
					/>
					{page}
				</div>

				{/* Simplify expressions checkbox */}
				<div className="flex items-center gap-4">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={simplified}
							onChange={handleSimplifiedChange}
							className="cursor-pointer"
						/>
						Simplify expressions
					</label>
				</div>
				<div hidden>
					<MJX>{macros}</MJX>
				</div>

				{/* MathJax output container */}
				{ctgs.success ? (
					<div className="flex items-start gap-40">
						<HOTRSS
							key={"HOTRSS:" + key(config)}
							{...config}
							k={ctgs.k}
							l={ctgs.l}
						/>
						<Answer
							key={"Answer:" + key(config)}
							{...config}
							k={ctgs.k}
							l={ctgs.l}
						/>
					</div>
				) : (
					<p className="text-red-600">not contiguous!</p>
				)}
			</div>
		</KaTeXProvider>
	);
}

function key({ ringType, alpha, simplified }: TRConfig) {
	return `${ringType}.${simplified}.${alpha.join(",")}`;
}

const { raw } = String;

function HOTRSS({
	n,
	alpha,
	page,
	ringType,
	k,
	l,
	simplified,
}: TRConfig & {
	k: number;
	l: number;
}) {
	const max = simplified ? l : n;
	const rows = range(max + 1).map((s) => {
		s = max - s;
		if (alpha[s] < 0) return "";

		let left = "";
		let right = "";

		// char p
		if (ringType === "char-p") {
			// left
			const leftLength = s - 1;

			const leftTwist = 0;

			if (!simplified || leftLength >= 0) {
				left = raw`\dRW[${leftLength}]^j_S`;

				if (leftTwist !== 0) {
					left += raw`\otimes \{ p^{${leftTwist} \}`;
				}
			}

			// right
			right = raw`\dRW[${s}]^j_S`;

			const rightTwist = 0;
			if (rightTwist !== 0) {
				right += raw`\otimes \{ p^{${rightTwist} \}`;
			}
		}
		// perfectoid
		else {
			// left
			const leftLength = s - 1 - Math.max(page - k - 1, 0);

			left = raw`\dRW[${leftLength}]^j_{S/R}`;

			if (page > 0) {
				const quotient = fmt(
					Object.fromEntries(range(s, s + 1).map((r) => phiXi(r, alpha[r]))),
				);
				left = raw`\dfrac{${left}}{${quotient}}`;
			}

			const leftTwist = fmt(
				Object.fromEntries(range(s).map((r) => phiXi(r, alpha[r]))),
			);
			if (leftTwist !== "1") {
				left += raw`\otimes \{ ${leftTwist} \}`;
			}

			if (leftLength < 0) {
				if (simplified) {
					left = "";
				} else {
					left = raw`\color{lightgray}${left}`;
				}
			}

			// right
			right = raw`\dRW[${s}]^j_{S/R}`;

			if (page > 0) {
				if (s === 0) {
					if (!simplified) {
						right = raw`\textcolor{gray}{\Fil^{${s}}}${right}`;
					}
				} else {
					right = raw`\Fil^{${s}}${right}`;
				}
			}

			const rightTwist = fmt(
				Object.fromEntries(
					range(s + constrain(1, page, n + 1 - s)).map((r) => {
						if (r === 0) return [raw`\xi`, alpha[0]];
						return [raw`\phi^{${-r}}(\xi)`, alpha[r]];
					}),
				),
			);
			if (rightTwist !== "1") {
				right += raw`\otimes \{ ${rightTwist} \}`;
			}
		}

		// alignment
		left = `*!R{${left}}`;
		right = `*!L{${right}}`;

		// differentials
		if (right && s + page <= max) {
			if (page === 0 && s === 0) {
				if (!simplified) {
					right += raw` \ar@[lightgray][` + "u".repeat(page) + "l]";
				}
			} else {
				right += raw` \ar[` + "u".repeat(page) + "l]";
			}
		}

		return raw`\color{gray} ${s} &  ${left} & ${right}`;
	});

	const formattedPage = page === n + 1 ? raw`\infty` : page;

	// annotation
	rows.push(
		raw`E_{${formattedPage}} & \color{gray} \TR^{${n}}_{\alpha-1,j} & \color{gray} \TR^{${n}}_{\alpha,j}`,
	);
	const tex = "\\xymatrix{\n" + rows.join("\\\\\n") + "\n}";

	return (
		<div className="flex flex-col">
			<MJX display span>
				{tex}
			</MJX>
			{/* <pre className="bg-gray-200 rounded-sm px-2 py-1 max-w-40">{tex}</pre> */}
		</div>
	);
}

function Answer({
	n,
	alpha,
	page,
	ringType,
	k,
	l,
	simplified,
}: TRConfig & {
	k: number;
	l: number;
}) {
	const lines: string[] = [];
	if (ringType === "char-p") {
	} else {
		// left
		let left = "";

		// length
		left = raw`\dRW{${k - 1}}^j_{S/R}`;

		// quotient
		const leftQuotient = fmt(
			Object.fromEntries(
				range(k, l + 1).map((r) => {
					if (r === 0) return [raw`\xi`, alpha[0]];
					return [raw`\phi^{${-r}}(\xi)`, alpha[r]];
				}),
			),
		);
		if (leftQuotient !== "1") {
			left = raw`\frac{${left}}{${leftQuotient}}`;
		}

		const leftTwist = fmt(
			Object.fromEntries(
				range(l + 1).map((r) => {
					if (r === 0) return [raw`\xi`, alpha[0]];
					return [raw`\phi^{${-r}}(\xi)`, alpha[r]];
				}),
			),
		);

		if (leftTwist !== "1") {
			left = raw`${left} \otimes \{${leftTwist}\}`;
		}

		if (k === 0) {
			if (simplified) {
				left = "0";
			} else {
				left = raw`\fade{${left}}`;
			}
		} else {
		}

		// right
		let right = "";

		// filtration
		if (k === 0) {
			if (!simplified) {
				right += raw`\textcolor{lightgray}{\Fil^0}`;
			}
		} else {
			right += raw`\Fil^{${k}}`;
		}

		// length
		right += raw`\dRW{${l}}^j_{S/R}`;

		// twists
		const rightTwist = fmt(
			Object.fromEntries(
				range(l + 1).map((r) => {
					if (r === 0) return [raw`\xi`, alpha[0]];
					return [raw`\phi^{${-r}}(\xi)`, alpha[r]];
				}),
			),
		);
		if (rightTwist !== "1") {
			right += raw`\otimes \{ ${rightTwist} \}`;
		}

		lines.push(raw`\TR^{${n}}_{\alpha,j}(S;\mathbf Z_p) &= ${right}`);
		lines.push(raw`\TR^{${n}}_{\alpha-1,j}(S;\mathbf Z_p) &= ${left}`);
	}

	return <KTX>{raw`\begin{aligned}${lines.join("\\\\")}\end{aligned}`}</KTX>;
}

function phiXi(phi: number, power: number) {
	if (phi === 0) return [raw`\xi`, power];
	if (phi === 1) return [raw`\phi(\xi)`, power];
	return [raw`\phi^{${phi}}(\xi)`, power];
}

function getContiguousBounds(alpha: number[]):
	| {
			success: true;
			k: number;
			l: number;
	  }
	| {
			success: false;
	  } {
	const k = alpha.findIndex((v) => v >= 0);
	const l = alpha.findLastIndex((v) => v >= 0);

	for (let i = k; i <= l; ++i) {
		// not contiguous
		if (alpha[i] < 0) {
			return { success: false };
		}
	}

	return { success: true, k, l };
}
