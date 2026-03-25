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
	const [n, setN] = useState(2);
	const [alpha, setCoefficients] = useState<number[]>([1, 2, 3]);
	const [ringType, setRingType] =
		useState<TRConfig["ringType"]>("torsion-free");
	const [page, setSpectralSequenceRange] = useState(0);

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

	// Trigger MathJax render when config changes
	const config: TRConfig = {
		n,
		alpha,
		ringType,
		page,
	};

	return (
		<div className="tr-container">
			{/* n input */}
			<div className="tr-input-row">
				<label htmlFor="tr-n-input">
					<strong>n</strong> (non-negative integer):
				</label>
				<input
					id="tr-n-input"
					type="number"
					min={0}
					value={n}
					onChange={handleNChange}
					className="tr-n-input"
				/>
			</div>

			{/* Coefficients table */}
			<div className="tr-coefficients-section">
				<table className="tr-coefficients-table">
					<tbody>
						<tr>
							{alpha.map((coeff, i) => (
								<td key={i}>
									<input
										type="number"
										value={coeff}
										onChange={(e) =>
											handleCoefficientChange(i, parseInt(e.target.value) || 0)
										}
										className="tr-coefficient-input"
									/>
								</td>
							))}
						</tr>
						<tr className="tr-index-row">
							{alpha.map((_, i) => (
								<td key={i} className="tr-index-cell">
									{i}
								</td>
							))}
						</tr>
					</tbody>
				</table>
			</div>

			{/* Ring type selection */}
			<div className="tr-ring-type-section">
				<span>
					<strong>Ring type:</strong>
				</span>
				<label className="tr-radio-label">
					<input
						type="radio"
						name="ring-type"
						value="char-p"
						checked={ringType === "char-p"}
						onChange={handleRingTypeChange}
					/>
					characteristic <em>p</em>
				</label>
				<label className="tr-radio-label">
					<input
						type="radio"
						name="ring-type"
						value="torsion-free"
						checked={ringType === "torsion-free"}
						onChange={handleRingTypeChange}
					/>
					torsion-free perfectoid
				</label>
			</div>

			{/* Spectral sequence range slider */}
			<div className="tr-spectral-section">
				<label htmlFor="tr-spectral-range">
					<strong>Spectral sequence page:</strong> {page}
				</label>
				<input
					id="tr-spectral-range"
					type="range"
					min={0}
					max={n + 1}
					value={page}
					onChange={handleSpectralSequenceChange}
					className="tr-spectral-slider"
				/>
				<span className="tr-spectral-bounds">0 to {n + 1}</span>
			</div>
			<div hidden>
				<MJX>{macros}</MJX>
			</div>

			{/* MathJax output container */}
			<HOTRSS key={key(config)} {...config} k={0} l={config.n} />
		</div>
	);
}

function key({ ringType, alpha }: TRConfig) {
	return `${ringType}.${alpha.join(",")}`;
}

const { raw } = String;

function HOTRSS({
	n,
	alpha,
	page,
	ringType,
	k,
}: TRConfig & {
	k: number;
	l: number;
}) {
	const rows = range(n + 1).map((s) => {
		s = n - s;
		if (alpha[s] < 0) return "";

		let left = "";
		let right = "";

		// char p
		if (ringType === "char-p") {
			if (s > 0) {
				// left
				left = raw`\dRW[${s - 1}]^j_S`;

				const leftTwist = 0;
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
			if (s > 0) {
				const leftLength = s - 1 - Math.max(page - 1, 0);
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
			}

			// right
			right = raw`\dRW[${s}]^j_{S/R}`;

			if (page > 0 && s > 0) {
				right = raw`\Fil^{${s}}${right}`;
			}

			const rightTwist = fmt(
				Object.fromEntries(
					range(s + constrain(1, page, n + 1 - s)).map((r) => {
						if (r === 0) return [raw`\xi`, alpha[0]];
						if (r === 1) return [raw`\phi(\xi)`, alpha[1]];
						return [raw`\phi^{${r}}(\xi)`, alpha[r]];
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
		if (right && s + page <= n) {
			if (page === 0 && s === 0) {
			} else {
				right += raw` \ar[` + "u".repeat(page) + "l]";
			}
		}

		return raw`\color{gray} ${s} &  ${left} & ${right}`;
	});

	const formattedPage = page === n + 1 ? raw`\infty` : page;

	rows.push(
		raw`E_{${formattedPage}} & \color{gray} \TR^{${n}}_{\alpha-1,j} & \color{gray} \TR^{${n}}_{\alpha,j}`,
	);
	const tex = "\\xymatrix{\n" + rows.join("\\\\\n") + "\n}";

	return (
		<>
			<MJX display span>
				{tex}
			</MJX>
			<pre className="bg-gray-200 rounded-sm px-2 py-1">{tex}</pre>
		</>
	);
}

function phiXi(phi: number, power: number) {
	if (phi === 0) return [raw`\xi`, power];
	if (phi === 1) return [raw`\phi(\xi)`, power];
	return [raw`\phi^{${phi}}(\xi)`, power];
}
