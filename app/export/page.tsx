import { ExportButton } from '../components/ExportButton';

export default function ExportPage() {
  return (
    <main className="px-4 pt-6">
      <h1 className="text-3xl font-bold mb-1">Export</h1>
      <p className="text-xs text-[var(--color-muted)] mb-6">
        Download all your data as a Markdown file.
      </p>
      <ExportButton />
    </main>
  );
}
