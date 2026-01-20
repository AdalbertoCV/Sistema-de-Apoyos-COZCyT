export default function StatusDocument({ title, description }) {
  return (
    <div className="flex flex-col pb-2 mt-1">
      <h2 className="text-[var(--principal-f)] font-semibold text-lg text-center">
        {title}
      </h2>
      <h3 className="text-[var(--negro)] font-medium text-sm text-center">
        {description}
      </h3>
    </div>
  );
}
