export default function Error({ error }: { error: Error }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-red-700">Error</h3>
      <code>{error.stack || `Fate Error: ${error.message}`}</code>

      <a className="block cursor-pointer underline" onClick={() => window.location.reload()}>
        Try again
      </a>
    </div>
  );
}
