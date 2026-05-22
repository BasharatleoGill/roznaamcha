export type Workspace = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export const WORKSPACE_COLORS = [
  "#176b5d", // primary teal
  "#4f74b9", // blue
  "#b66a34", // accent orange
  "#7d5aa6", // purple
  "#c84a3c", // red
  "#16845f", // green
] as const;

export const FREE_WORKSPACE_LIMIT = 3;
