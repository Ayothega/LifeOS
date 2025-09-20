export default function Quote() {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-[var(--accent-color)] p-4 rounded-lg text-center">
        <p className="text-sm text-[var(--text-secondary)]">&ldquo;The only way to do great work is to love what you do.&rdquo;</p>
        <p className="text-xs text-slate-500 mt-2">- Steve Jobs</p>
      </div>
    </div>
  );
}
