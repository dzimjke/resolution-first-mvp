export function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatNumber(value?: number | null, suffix = "") {
  if (value === null || value === undefined) return "—";
  return `${value}${suffix}`;
}
