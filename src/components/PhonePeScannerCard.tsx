import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Download
} from 'lucide-react';
import { useLanguage } from '../translations';

export interface PhonePeScannerCardProps {
  amount?: number;
  planName?: string;
  payeeName?: string;
  upiId?: string;
  onOpenApp?: () => void;
  className?: string;
}

export const PhonePeScannerCard: React.FC<PhonePeScannerCardProps> = ({
  amount = 100,
  planName = 'PCOS Care Plan',
  payeeName = 'JANGA BHARATH SATYA SAI',
  upiId = 'jangabharathsatyasai@ybl',
  onOpenApp,
  className = ''
}) => {
  const { isTelugu } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);

  // Standard UPI URI with PhonePe parameter compatibility
  const note = `PCOSense ${planName} ${amount}`;
  const upiPayUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&mode=02&orgid=159015`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPhonePe = () => {
    if (onOpenApp) {
      onOpenApp();
    } else {
      window.location.href = upiPayUri;
    }
  };

  return (
    <div className={`relative w-full max-w-sm mx-auto rounded-3xl bg-black text-white p-6 sm:p-7 shadow-2xl border border-neutral-800 flex flex-col items-center text-center overflow-hidden transition-all duration-300 hover:border-purple-500/50 ${className}`}>
      
      {/* PhonePe Purple Ambient Glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/20 blur-3xl pointer-events-none rounded-full" />

      {/* Top PhonePe Logo & Branding */}
      <div className="relative z-10 flex items-center justify-center gap-2 mb-2">
        <div className="h-10 w-10 rounded-full bg-[#5f259f] flex items-center justify-center shadow-lg border border-purple-400/40 shrink-0">
          {/* Authentic PhonePe Devanagari 'Pe' glyph */}
          <svg
            className="w-6 h-6 text-white fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.2 14.8h-2.1v-4.3H9.8v-1.8h1.3v-1.1c0-1.8 1.1-2.8 2.7-2.8.8 0 1.5.1 1.7.1v2h-1.2c-.9 0-1.1.4-1.1 1.1v.7h2.2l-.3 1.8h-1.9v4.3z" />
          </svg>
        </div>
        <span className="text-2xl font-black tracking-tight text-white font-sans">
          PhonePe
        </span>
      </div>

      {/* Subheaders matching PhonePe Standee */}
      <div className="relative z-10 space-y-1 mb-5">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#a855f7]">
          ACCEPTED HERE
        </p>
        <p className="text-xs font-medium text-slate-300 tracking-wide">
          Scan & Pay Using PhonePe App
        </p>
      </div>

      {/* QR Code Container (White Matte with Rounded Corners) */}
      <div className="relative z-10 p-4 rounded-3xl bg-white shadow-2xl flex flex-col items-center justify-center mb-5 border-4 border-[#5f259f]/30">
        <QRCodeSVG
          value={upiPayUri}
          size={195}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="%235f259f"/><circle cx="18" cy="18" r="15" fill="none" stroke="white" stroke-width="2"/><text x="18" y="24" font-size="18" font-family="Arial, sans-serif" font-weight="bold" fill="white" text-anchor="middle">पे</text></svg>',
            x: undefined,
            y: undefined,
            height: 38,
            width: 38,
            excavate: true
          }}
        />

        {/* Dynamic Amount Pill */}
        <div className="mt-2.5 px-3 py-1 rounded-full bg-slate-950 text-white flex items-center gap-1.5 shadow-sm">
          <span className="text-[10px] text-purple-300 uppercase font-semibold">Amount:</span>
          <span className="text-sm font-black text-amber-300 font-mono">₹{amount}</span>
        </div>
      </div>

      {/* Beneficiary Name matching User's Uploaded Scanner */}
      <div className="relative z-10 space-y-1 mb-4">
        <h4 className="text-sm sm:text-base font-black tracking-wider text-white uppercase font-sans">
          {payeeName}
        </h4>
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">{upiId}</span>
          <button
            type="button"
            onClick={copyUpiId}
            className="text-purple-400 hover:text-purple-300 transition-colors p-1 rounded-md hover:bg-slate-900"
            title="Copy UPI ID"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Pay Directly Button */}
      <button
        type="button"
        onClick={handleOpenPhonePe}
        className="relative z-10 w-full py-3 px-4 rounded-2xl bg-[#5f259f] hover:bg-[#501c87] active:scale-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 cursor-pointer mb-4"
      >
        <Smartphone className="h-4 w-4" />
        <span>Open PhonePe App (₹{amount})</span>
      </button>

      {/* Legal Footer matching the Standee */}
      <p className="relative z-10 text-[10px] text-slate-500 font-medium leading-tight">
        © 2026, All rights reserved, PhonePe Ltd (Formerly known as 'PhonePe Private Ltd')
      </p>

    </div>
  );
};
