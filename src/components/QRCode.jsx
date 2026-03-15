import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

export default function QRCode({ value, size = 120, className }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#0F172A', light: '#FFFFFF' }
    })
  }, [value, size])

  return <canvas ref={canvasRef} className={className} style={{ borderRadius: 6 }} />
}
