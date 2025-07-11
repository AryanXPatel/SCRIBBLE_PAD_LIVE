"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Download } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import {
  FacebookShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
} from "react-share"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  onCopy: (text: string) => Promise<void>
  isDarkMode: boolean
}

export function ShareDialog({ isOpen, onClose, shareUrl, onCopy, isDarkMode }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await onCopy(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = "scribble-pad-qr.png"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const shareTitle = "Check out this note from Scribble Pad!"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-md ${
          isDarkMode ? "bg-[#3a3d4a] border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <DialogHeader>
          <DialogTitle className={isDarkMode ? "text-white" : "text-gray-900"}>Share Your Document</DialogTitle>
          <DialogDescription className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            Anyone with this link can view your document. The content is encoded in the URL for privacy.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={shareUrl}
              readOnly
              className={`text-sm ${
                isDarkMode ? "bg-gray-700/50 border-gray-600 text-gray-200" : "bg-gray-50 border-gray-300 text-gray-700"
              }`}
            />
          </div>
          <Button size="sm" className="px-3" onClick={handleCopy} variant={isDarkMode ? "secondary" : "default"}>
            <span className="sr-only">Copy</span>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {shareUrl && (
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="bg-white p-2 rounded-md">
              <QRCodeCanvas id="qr-code-canvas" value={shareUrl} size={180} />
            </div>
            <Button onClick={downloadQRCode} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm font-medium text-center mb-3">Or share via</p>
          <div className="grid grid-cols-4 gap-4">
            <WhatsappShareButton url={shareUrl} title={shareTitle} separator=":: ">
              <WhatsappIcon size={42} round />
            </WhatsappShareButton>
            <TelegramShareButton url={shareUrl} title={shareTitle}>
              <TelegramIcon size={42} round />
            </TelegramShareButton>
            <TwitterShareButton url={shareUrl} title={shareTitle}>
              <TwitterIcon size={42} round />
            </TwitterShareButton>
            <FacebookShareButton url={shareUrl} quote={shareTitle}>
              <FacebookIcon size={42} round />
            </FacebookShareButton>
          </div>
        </div>

        <div className={`text-xs mt-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <p className="mb-2">
            <strong>Privacy Note:</strong> Your document content is encoded directly in the URL. No data is sent to
            external servers.
          </p>
          <p>Share this link to let others view your document. They can save it locally if needed.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
