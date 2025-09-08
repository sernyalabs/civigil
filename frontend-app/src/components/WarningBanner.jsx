export default function WarningBanner({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none">⚠️</span>
        <div className="text-sm">
          {children ?? (
            <>
                Submitting false or misleading reports wastes valuable police time and resources.
                Reports are anonymous to the public, but every submission is assigned an internal ID.
                This ID can be used by authorities to trace and investigate misuse if required by law.
                All false reports are logged and may lead to action.
            </>
          )}
        </div>
      </div>
    </div>
  );
}