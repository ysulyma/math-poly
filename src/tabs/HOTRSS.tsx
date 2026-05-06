import { MJX } from "@liqvid/mathjax/plain";
import { constrain, range } from "@liqvid/utils";
import { useRef } from "react";

import { fmt, sum } from "../utils.ts";

import { phiXi, type TRConfig } from "./TR.tsx";

const { raw } = String;

export function HOTRSS({
  n,
  alpha,
  page: r,
  ringType,
  k,
  l,
  simplified,
}: TRConfig & {
  k: number;
  l: number;
}) {
  const rows = range(n + 1).map((s) => {
    s = n - s;
    if (alpha[s] < 0 && r > 0) {
      return raw`\fade{${s}} &&`;
    }

    let left = "";
    let right = "";

    // char p
    if (ringType === "char-p") {
      const rLower = Math.min(r, s - k + 1);
      const rUpper = Math.min(r, l - s + 1);

      // left
      const leftLength =
        r === 0 ? s - 1 : s - rLower - sum(alpha.slice(s - rLower + 1, s));

      left = raw`\dRW[${leftLength}]^j_S`;

      const quotient = fmt({ p: alpha[s] });

      if (r > 0) {
        if (alpha[s] <= leftLength) {
          left = raw`\dfrac{${left}}{${quotient}}`;
        }
      }

      const leftTwist = fmt({ p: sum(alpha.slice(0, s)) });
      if (leftTwist !== "1") {
        left += raw`\otimes \{ ${leftTwist} \}`;
      }

      if (leftLength < 0) {
        if (simplified) {
          left = "";
        } else {
          left = raw`\fade{${left}}`;
        }
      }

      if (r > 0 && quotient === "1") {
        if (simplified) {
          left = "";
        } else {
          left = raw`\fade{${left}}`;
        }
      }

      // right
      const rightLength =
        alpha[s] >= 0 ? s - sum(alpha.slice(s + 1, s + rUpper)) : s - 1;

      right = raw`\dRW[${rightLength}]^j_S`;

      // filtration exponent: k - (d_k + ... + d_ℓ)
      if (r > 0) {
        const filExp = s - sum(alpha.slice(s, s + rUpper));
        if (filExp <= 0) {
          if (!simplified) {
            right = raw`\fade{\Fil^{${filExp}}}${right}`;
          }
        } else {
          right = raw`\Fil^{${filExp}}${right}`;
        }
      }

      let rightTwist = "1";
      if (alpha[s] >= 0) {
        if (r === 0) {
          rightTwist = fmt({
            p: sum(alpha.slice(0, s + 1)),
          });
        } else {
          rightTwist = fmt({
            p: sum(alpha.slice(0, s + rUpper)),
          });
        }
      } else {
        // only happens on page 0
        rightTwist = fmt({ p: sum(alpha.slice(0, s)) });
      }

      if (rightTwist !== "1") {
        right += raw`\otimes \{ ${rightTwist} \}`;
      }

      if (rightLength < 0) {
        if (simplified) {
          right = "";
        } else {
          right = raw`\fade{${right}}`;
        }
      }
    }

    // perfectoid
    else {
      // left
      const leftLength = Math.max(s - r, k - 1);

      left = raw`\dRW[${leftLength}]^j_{S/R}`;

      if (r > 0) {
        const quotient = fmt(Object.fromEntries([phiXi(s, alpha[s])]));
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
          left = raw`\fade{${left}}`;
        }
      }

      // right
      const rightLength = alpha[s] >= 0 ? s : s - 1;
      right = raw`\dRW[${rightLength}]^j_{S/R}`;

      if (r > 0) {
        if (s === 0) {
          if (!simplified) {
            right = raw`\fade{\Fil^{${s}}}${right}`;
          }
        } else {
          right = raw`\Fil^{${s}}${right}`;
        }
      }

      let rightTwist = "1";
      if (alpha[s] >= 0) {
        rightTwist = fmt(
          Object.fromEntries(
            range(s + constrain(1, r, l + 1 - s)).map((r) => {
              if (r === 0) return [raw`\xi`, alpha[0]];
              return [raw`\phi^{${-r}}(\xi)`, alpha[r]];
            }),
          ),
        );
      } else {
        // only happens on page 0
        rightTwist = fmt(
          Object.fromEntries(range(s).map((r) => phiXi(r, alpha[r]))),
        );
      }
      if (rightTwist !== "1") {
        right += raw`\otimes \{ ${rightTwist} \}`;
      }

      if (rightLength < 0) {
        if (simplified) {
          right = "";
        } else {
          right = raw`\fade{${right}}`;
        }
      }
    }

    // alignment
    left = `*!R{${left}}`;
    right = `*!L{${right}}`;

    // differentials
    if (right && s + r <= n) {
      if (r === 0 && s === 0) {
        if (!simplified) {
          right += raw` \ar@[lightgray][` + "u".repeat(r) + "l]";
        }
      } else {
        if (r === 0 || alpha[s + r] > 0) {
          right += raw` \ar[` + "u".repeat(r) + "l]";
        }
      }
    }

    return raw`\color{gray} ${s} &  ${left} & ${right}`;
  });

  const formattedPage = r === n + 1 ? raw`\infty` : r;

  // annotation
  rows.push(
    raw`E_{${formattedPage}} & \color{gray} \alpha-1 & \color{gray} \alpha`,
  );
  const tex = "\\xymatrix{\n" + rows.join("\\\\\n") + "\n}";

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col" ref={ref}>
      <MJX display span>
        {tex}
      </MJX>
      {/* <pre className="bg-gray-200 rounded-sm px-2 py-1 max-w-[500px] whitespace-pre-wrap"> */}
      {/* 	{tex} */}
      {/* </pre> */}
    </div>
  );
}
