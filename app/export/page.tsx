import { ExportFilters } from "@/components/export/export-filters"
import { ExportActions } from "@/components/export/export-actions"
import { ExportPreview } from "@/components/export/export-preview"

export default function ExportPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Data</h1>
        <p className="text-gray-600">Configure and export your restaurant data in various formats.</p>
      </div>

      <ExportFilters />
      <ExportActions />
      <ExportPreview />
    </div>
  )
}
