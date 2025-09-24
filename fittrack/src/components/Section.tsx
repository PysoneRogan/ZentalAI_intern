type SectionProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export default function Section({ title, icon, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-100/60 p-4">
      <div className="mb-4 flex items-center gap-2 text-slate-700">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}