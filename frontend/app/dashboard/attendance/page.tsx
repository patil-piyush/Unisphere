"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import QrScanner from "qr-scanner"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Camera, RotateCcw, Clock } from "lucide-react"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

export default function UserAttendanceScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const qrBoxRef = useRef<HTMLDivElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)

  const [isCameraOn, setIsCameraOn] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // init scanner
  useEffect(() => {
    if (!videoRef.current || scannerRef.current) return

    const onScanSuccess = (result: QrScanner.ScanResult) => {
      const data = result?.data?.trim()
      if (!data) return

      // QR contains the token directly
      setScanResult(data)
      setStatusType("info")
      setStatusMessage("QR scanned. Submitting attendance...")

      // stop scanning once we have a token
      scannerRef.current?.stop()
      setIsCameraOn(false)
      submitAttendance(data)
    }

    const onScanFail = (err: string | Error) => {
      // noisy errors; keep quiet unless needed
      console.debug("QR scan error:", err)
    }

    scannerRef.current = new QrScanner(videoRef.current, onScanSuccess, {
      onDecodeError: onScanFail,
      preferredCamera: "environment",
      highlightScanRegion: true,
      highlightCodeOutline: true,
      overlay: qrBoxRef.current || undefined,
    })

    return () => {
      scannerRef.current?.stop()
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
  }, [])

  const startCamera = async () => {
    try {
      setStatusMessage(null)
      await scannerRef.current?.start()
      setIsCameraOn(true)
    } catch (err) {
      console.error("Failed to start camera", err)
      setIsCameraOn(false)
      setStatusType("error")
      setStatusMessage(
        "Camera is blocked or not accessible. Please allow camera permission and reload."
      )
    }
  }

  const stopCamera = () => {
    scannerRef.current?.stop()
    setIsCameraOn(false)
  }

  const submitAttendance = async (token: string) => {
    try {
      setIsSubmitting(true)
      const res = await axios.post(
        `${BackendURL}/api/events/attendance/scan`,
        { token },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      )

      setStatusType("success")
      setStatusMessage(res.data.message || "Attendance marked successfully")
    } catch (err: any) {
      console.error("Attendance scan failed", err)
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to mark attendance"
      setStatusType("error")
      setStatusMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRescan = () => {
    setScanResult(null)
    setStatusMessage(null)
    startCamera()
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scan Event QR</h1>
          <p className="text-muted-foreground">
            Point your camera at the event QR code to mark attendance.
          </p>
        </div>
        <Button
          variant={isCameraOn ? "outline" : "default"}
          onClick={isCameraOn ? stopCamera : startCamera}
        >
          <Camera className="mr-2 h-4 w-4" />
          {isCameraOn ? "Stop Camera" : "Start Camera"}
        </Button>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col items-center gap-4">
        <div className="relative w-full max-w-xs aspect-square qr-reader overflow-hidden rounded-2xl bg-black/80">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <div ref={qrBoxRef} className="absolute inset-0 flex items-center justify-center">
            {!isCameraOn && (
              <div className="text-center text-muted-foreground">
                <p className="mb-2 text-sm">
                  Click &quot;Start Camera&quot; and point at the QR shown by the club.
                </p>
              </div>
            )}
          </div>
        </div>

        {scanResult && (
          <div className="text-xs text-muted-foreground break-all max-w-full">
            Token: {scanResult}
          </div>
        )}

        {statusMessage && (
          <div
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
              statusType === "success"
                ? "bg-emerald-500/10 text-emerald-500"
                : statusType === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}
          >
            {statusType === "success" && <CheckCircle2 className="h-4 w-4" />}
            {statusType === "error" && <AlertCircle className="h-4 w-4" />}
            {statusType === "info" && <Clock className="h-4 w-4" />}
            <span>{statusMessage}</span>
          </div>
        )}

        {!isCameraOn && (
          <Button
            variant="outline"
            onClick={handleRescan}
            disabled={isSubmitting}
            className="mt-2"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Rescan
          </Button>
        )}
      </div>
    </div>
  )
}
