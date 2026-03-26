import { KTX } from "@liqvid/katex";
import { range } from "@liqvid/utils";
import { fmt, sum } from "../utils";
import type { TRConfig } from "./TR";

const { raw } = String;

export function Answer({
	n,
	alpha,
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
		// right: TR^n_{α,j}(S | S_{W(k)}) = Fil^{k-(d_k+...+d_ℓ)} W_ℓ Ω^j_S ⊗ {p^{d_0+...+d_ℓ}}
		let right = "";

		// filtration exponent: k - (d_k + ... + d_ℓ)
		const filExp = k - sum(alpha.slice(k, l + 1));
		if (filExp <= 0) {
			if (!simplified) {
				right += raw`\fade{\Fil^{${filExp}}}`;
			}
		} else {
			right += raw`\Fil^{${filExp}}`;
		}
		right += raw`\dRW{${l}}^j_S`;

		// twist: p^{d_0 + ... + d_ℓ}
		const rightTwist = fmt({ p: sum(alpha.slice(0, l + 1)) });
		if (rightTwist !== "1") {
			right += raw`\otimes \{${rightTwist}\}`;
		}

		// left: TR^n_{α-1,j}(S | S_{W(k)}) = (W_{k-1} Ω^j_S) / (p^{d_k+...+d_ℓ}) ⊗ {p^{d_0+...+d_{k-1}}}
		let left = "";

		// length: W_{k-1} Ω^j_S
		left = raw`\dRW{${k - 1}}^j_S`;

		// quotient: p^{d_k + ... + d_ℓ}
		const leftQuotientExp = sum(alpha.slice(k, l + 1));
		if (leftQuotientExp !== 0) {
			left = raw`\frac{${left}}{p^{${leftQuotientExp}}}`;
		}

		// twist: p^{d_0 + ... + d_{k-1}}
		const leftTwistExp = sum(alpha.slice(0, k));
		if (leftTwistExp !== 0) {
			left += raw`\otimes \{p^{${leftTwistExp}}\}`;
		}

		if (k === 0) {
			if (simplified) {
				left = "0";
			} else {
				left = raw`\fade{${left}}`;
			}
		} else {
		}

		lines.push(raw`\TR^{${n}}_{\alpha,j}(S\mid \mathbf S_{\W(k)}) &= ${right}`);
		lines.push(
			raw`\TR^{${n}}_{\alpha-1,j}(S\mid \mathbf S_{\W(k)}) &= ${left}`,
		);
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
				range(Math.max(k, 0)).map((r) => {
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
				right += raw`\fade{\Fil^0}`;
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
