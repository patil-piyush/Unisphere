"use client"

import { FileText, Download, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import axios from "axios"

const BackendURL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

type ReportType = "monthly" | "quarterly" | "yearly"

type GeneratedReport = {
  id: number
  name: string
  type: ReportType
  month: number | "" // 0–11 when monthly
  quarter: number | "" // 1–4 when quarterly
  year: number
  createdAt: string
}

export default function ReportsPage() {
  const [type, setType] = useState<ReportType>("monthly")
  const [month, setMonth] = useState<number | "">("")
  const [quarter, setQuarter] = useState<number | "">("")
  const [year, setYear] = useState<number>(2025)
  const [loading, setLoading] = useState(false)

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(
    [],
  )

  const monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // core function that calls backend and downloads PDF
  const generateAndDownload = async (params: {
    type: ReportType
    month: number | ""
    quarter: number | ""
    year: number
    fileName?: string
  }) => {
    const { type, month, quarter, year, fileName } = params

    const body: any = {
      type,
      month: "",
      quarter: "",
      year: String(year),
    }

    if (type === "monthly") {
      if (month === "") {
        alert("Please select a month")
        return
      }
      body.month = month
    }

    if (type === "quarterly") {
      if (quarter === "") {
        alert("Please select a quarter")
        return
      }
      body.quarter = quarter
    }

    const res = await axios.post(
      `${BackendURL}/api/admin/reports/generate`,
      body,
      {
        withCredentials: true,
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
      },
    )

    const blob = new Blob([res.data], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download =
      fileName || `institute-report-${type}-${year}${type === "monthly" && month !== "" ? `-${month + 1}` : ""}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  // Generate from current form
  const handleGenerate = async () => {
    try {
      setLoading(true)

      await generateAndDownload({ type, month, quarter, year })

      // add to history
      const newItem: GeneratedReport = {
        id: Date.now(),
        name:
          type === "monthly" && month !== ""
            ? `Monthly Report - ${monthLabels[month]} ${year}`
            : type === "quarterly" && quarter !== ""
              ? `Quarterly Report - Q${quarter} ${year}`
              : `Annual Report - ${year}`,
        type,
        month,
        quarter,
        year,
        createdAt: new Date().toLocaleString(),
      }

      setGeneratedReports((prev) => [newItem, ...prev])
    } catch (err) {
      console.error("Error generating report:", err)
      alert("Error generating report")
    } finally {
      setLoading(false)
    }
  }

  // Regenerate/download an existing report
  const handleDownloadAgain = async (item: GeneratedReport) => {
    try {
      setLoading(true)
      await generateAndDownload({
        type: item.type,
        month: item.month,
        quarter: item.quarter,
        year: item.year,
        fileName: item.name.replace(/\s+/g, "-") + ".pdf",
      })
    } catch (err) {
      console.error("Error downloading report:", err)
      alert("Error downloading report")
    } finally {
      setLoading(false)
    }
  }

  // Rename a history entry
  const handleRename = (id: number) => {
    const item = generatedReports.find((r) => r.id === id)
    if (!item) return

    const newName = window.prompt("Enter new name for this report:", item.name)
    if (!newName || !newName.trim()) return

    setGeneratedReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: newName.trim() } : r)),
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Generate and download campus reports
        </p>
      </div>

      {/* Generate Report */}
      <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold mb-4">Generate New Report</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type */}
            <select
              className="px-4 py-2 rounded-lg border border-border/50 bg-background"
              value={type}
              onChange={(e) => {
                const t = e.target.value as ReportType
                setType(t)
              }}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Annual</option>
            </select>

            {/* Month (only for monthly) */}
            {type === "monthly" && (
              <select
                className="px-4 py-2 rounded-lg border border-border/50 bg-background"
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value === "" ? "" : Number(e.target.value))
                }
              >
                <option value="">Select month</option>
                {monthLabels.map((label, idx) => (
                  <option key={idx} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
            )}

            {/* Quarter (only for quarterly) */}
            {type === "quarterly" && (
              <select
                className="px-4 py-2 rounded-lg border border-border/50 bg-background"
                value={quarter}
                onChange={(e) =>
                  setQuarter(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              >
                <option value="">Select quarter</option>
                <option value={1}>Q1 (Jan–Mar)</option>
                <option value={2}>Q2 (Apr–Jun)</option>
                <option value={3}>Q3 (Jul–Sep)</option>
                <option value={4}>Q4 (Oct–Dec)</option>
              </select>
            )}

            {/* Year */}
            <input
              type="number"
              className="px-4 py-2 rounded-lg border border-border/50 bg-background"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              placeholder="Year"
            />

            {/* Generate button */}
            <Button
              className="bg-primary hover:bg-primary/90 md:col-span-1"
              onClick={handleGenerate}
              disabled={loading}
            >
              <FileText className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </div>

      {/* Generated Reports History */}
      <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold mb-4">Generated Reports History</h2>

        {generatedReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reports generated yet.
          </p>
        ) : (
          <div className="space-y-3">
            {generatedReports.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:border-border/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <button
                        type="button"
                        onClick={() => handleRename(item.id)}
                        className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Rename
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.type.toUpperCase()} • Year {item.year}
                      {item.type === "monthly" && item.month !== "" &&
                        ` • ${monthLabels[item.month]}`}
                      {item.type === "quarterly" && item.quarter !== "" &&
                        ` • Q${item.quarter}`}
                      {" • Generated at "}
                      {item.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge>{item.type.toUpperCase()}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadAgain(item)}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
