import { KaTeXProvider, KTX, parseMacros } from "@liqvid/katex";
import { MJX } from "@liqvid/mathjax/plain";
import { waitFor } from "@liqvid/utils";
import { useCallback, useEffect, useState } from "react";
import { macros } from "../macros";
import { Answer } from "./Answer";
import { HOTRSS } from "./HOTRSS";

const { raw } = String;

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

export function TR() {
	const [n, setN] = useState(2);
	const [alpha, setCoefficients] = useState<number[]>([1, 2, -1]);
	const [ringType, setRingType] = useState<TRConfig["ringType"]>("char-p");
	const [page, setSpectralSequenceRange] = useState(0);
	const [simplified, setSimplified] = useState(true);

	useEffect(() => {
		waitFor(() => window.MathJax !== undefined).then(() => {
			MathJax.typesetPromise();
		});
	}, []);

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

export function phiXi(phi: number, power: number) {
	if (phi === 0) return [raw`\xi`, power];
	return [raw`\phi^{${-phi}}(\xi)`, power];
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
