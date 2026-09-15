/** The `(01) — (About Me) — © 2026` marker row that opens each dark section. */
export default function SectionRail({
  index,
  label,
  year,
}: {
  index: string;
  label: string;
  year: number;
}) {
  return (
    <div className="v2-label flex items-center justify-between border-b border-white/10 pb-4 text-white/45">
      <span className="text-[var(--v2-accent)]">({index})</span>
      <span>({label})</span>
      <span>&copy; {year}</span>
    </div>
  );
}
