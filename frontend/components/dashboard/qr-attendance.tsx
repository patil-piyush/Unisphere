type QRAttendanceProps = {
  eventId: string
  eventName: string
  totalRegistered: number
  attendedCount: number
  qrCode?: string | null
  expiresIn?: number | null
  sessionId?: string | null
}

export function QRAttendance({
  eventName,
  totalRegistered,
  attendedCount,
  qrCode,
  expiresIn,
}: QRAttendanceProps) {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold">{eventName}</h2>

      {qrCode ? (
        <>
          <img
            src={qrCode}
            alt="Attendance QR Code"
            className="w-56 h-56 border rounded-xl bg-white"
          />
          {typeof expiresIn === "number" && (
            <p className="text-sm text-muted-foreground">
              QR refreshes in {expiresIn} seconds
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Click “Start Attendance Session” to generate a QR code.
        </p>
      )}


      <p className="text-sm">
        Registered: {totalRegistered} · Attended: {attendedCount}
      </p>
    </div>
  )
}