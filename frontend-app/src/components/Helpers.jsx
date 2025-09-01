function Stat({ title, value }) {
  return (
    <div className="p-4 border rounded-2xl bg-white">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-3xl font-bold mt-1">{value ?? "—"}</div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-4 py-3 grid md:grid-cols-12 gap-3">
          <div className="md:col-span-6 h-6 bg-gray-100 rounded animate-pulse" />
          <div className="md:col-span-3 h-6 bg-gray-100 rounded animate-pulse" />
          <div className="md:col-span-3 h-6 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export { Stat, ListSkeleton }