import { Card, PageHeader } from "@/components/ui";

export function PhaseTwoPage({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card title="Phase 2で追加予定">
        <ul className="grid gap-2 text-sm text-slate-300">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-md border border-white/10 bg-[#0d141c] px-3 py-2"
            >
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
