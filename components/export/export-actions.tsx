"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"

export function ExportActions() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)

  const handleExport = async (format: "csv" | "excel") => {
    setIsExporting(true)
    setExportFormat(format)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would trigger the actual export
    console.log(`Exporting data as ${format}`)

    setIsExporting(false)
    setExportFormat(null)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Export Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            className="h-20 flex flex-col items-center justify-center space-y-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isExporting && exportFormat === "csv" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FileText className="h-6 w-6" />
            )}
            <span className="text-sm font-medium">
              {isExporting && exportFormat === "csv" ? "Exporting..." : "Export as CSV"}
            </span>
          </Button>

          <Button
            onClick={() => handleExport("excel")}
            disabled={isExporting}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            {isExporting && exportFormat === "excel" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-6 w-6" />
            )}
            <span className="text-sm font-medium">
              {isExporting && exportFormat === "excel" ? "Exporting..." : "Export as Excel"}
            </span>
          </Button>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Download className="h-4 w-4" />
            <span>Estimated records to export: 1,247 restaurants</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
