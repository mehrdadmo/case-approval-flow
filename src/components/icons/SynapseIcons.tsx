import { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

/** Document sheet — the atom of the system */
export const IconDoc = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3.5h7.5L18 8v12.5H6z" />
    <path d="M13.5 3.5V8H18" />
    <path d="M9 12h6M9 15.5h4" />
  </svg>
);

/** Processing — document being read line by line */
export const IconProcessing = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3.5h7.5L18 8v12.5H6z" />
    <path d="M13.5 3.5V8H18" />
    <path d="M9 11.5h6" opacity=".9" />
    <path d="M9 15h6" opacity=".45" />
    <circle cx="18.5" cy="18.5" r="3" fill="currentColor" stroke="none" opacity=".18" />
  </svg>
);

/** Review / HITL — human eye over a document */
export const IconReview = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3.5h7.5L18 8v5" />
    <path d="M13.5 3.5V8H18" />
    <path d="M6 3.5v17h5" />
    <path d="M12.5 17.5c1.6-2.2 5.4-2.2 7 0-1.6 2.2-5.4 2.2-7 0z" />
    <circle cx="16" cy="17.5" r=".9" fill="currentColor" stroke="none" />
  </svg>
);

/** Validated — node check */
export const IconValidated = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.2 12.3l2.6 2.6 5-5.4" />
  </svg>
);

/** Needs fix — mismatch between two records */
export const IconNeedsFix = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4.2l8 14.6H4z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none" />
  </svg>
);

/** Export — data leaving the system */
export const IconExport = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5v10" />
    <path d="M8.5 10.5L12 14l3.5-3.5" />
    <path d="M4.5 15.5v3a2 2 0 002 2h11a2 2 0 002-2v-3" />
  </svg>
);

/** Extraction — fields pulled out of a document */
export const IconExtract = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 3.5h6.5L15 7v4" />
    <path d="M11.5 3.5V7H15" />
    <path d="M5 3.5v17h5" />
    <rect x="13" y="13.5" width="7" height="3" rx="1" />
    <rect x="13" y="18" width="7" height="3" rx="1" />
  </svg>
);

/** Connected nodes — the Synapse reconciliation metaphor */
export const IconNodes = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="6.5" r="2.2" />
    <circle cx="18" cy="9" r="2.2" />
    <circle cx="10" cy="18" r="2.2" />
    <path d="M7.7 8L9 15.9M8 6.9l7.8 1.8M16.6 10.9l-4.9 5.6" />
  </svg>
);

/** Search */
export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.2" />
    <path d="M15.6 15.6L20 20" />
  </svg>
);

/** New case */
export const IconNewCase = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

/** Sidebar collapse / expand (RTL: panel on the right) */
export const IconPanelCollapse = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M14.5 4.5v15" />
    <path d="M9.5 9.5L7 12l2.5 2.5" />
  </svg>
);

export const IconPanelExpand = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M14.5 4.5v15" />
    <path d="M7 9.5L9.5 12 7 14.5" />
  </svg>
);

/** Back to human review */
export const IconReopen = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 9.5A8 8 0 1 1 4 14" />
    <path d="M4.2 4.8v4.9h4.9" />
  </svg>
);

/** Export formats */
export const IconSheet = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 9.5h16M9.5 9.5V20M14.5 9.5V20M4 15h16" />
  </svg>
);

export const IconTextDoc = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3.5h7.5L18 8v12.5H6z" />
    <path d="M13.5 3.5V8H18" />
    <path d="M9 12.5h6M9 16h4" />
  </svg>
);

export const IconCode = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />
  </svg>
);

/** Chevron for RTL "open" affordance */
export const IconChevronStart = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 6l-6 6 6 6" />
  </svg>
);
