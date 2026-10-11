import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, Sparkles, Sliders, Smartphone, Star } from 'lucide-react';

interface PrintableQrProps {
  businessName: string;
  tagline: string;
  scanInstruction: string;
  targetUrl: string;
  onTargetUrlChange?: (newUrl: string) => void;
}

export const PrintableQr: React.FC<PrintableQrProps> = ({
  businessName,
  scanInstruction,
  targetUrl,
  onTargetUrlChange,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>(targetUrl);
  const [variant, setVariant] = useState<'black' | 'white'>('black');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCustomUrl(targetUrl);
  }, [targetUrl]);

  useEffect(() => {
    async function generateLuxuryArtisticQr() {
      try {
        const urlToEncode = customUrl || window.location.origin;

        const qrRaw = QRCode.create(urlToEncode, { errorCorrectionLevel: 'H' });
        const moduleCount = qrRaw.modules.size;
        const matrix = qrRaw.modules.data;

        const canvasSize = 1000;
        const padding = 70;
        const cellSize = (canvasSize - padding * 2) / moduleCount;

        const canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        const isCornerFinderZone = (row: number, col: number) => {
          if (row < 8 && col < 8) return true;
          if (row < 8 && col >= moduleCount - 8) return true;
          if (row >= moduleCount - 8 && col < 8) return true;
          return false;
        };

        const centerStart = Math.floor((moduleCount - 11) / 2);
        const centerEnd = centerStart + 11;
        const isCenterBadgeZone = (row: number, col: number) => {
          return row >= centerStart && row <= centerEnd && col >= centerStart && col <= centerEnd;
        };

        ctx.fillStyle = '#0B0B0B';
        const radius = cellSize * 0.42;

        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            const isDark = matrix[row * moduleCount + col] === 1;

            if (isCornerFinderZone(row, col) || isCenterBadgeZone(row, col)) {
              continue;
            }

            if (isDark) {
              const x = padding + col * cellSize;
              const y = padding + row * cellSize;

              ctx.beginPath();
              ctx.roundRect(x + 0.6, y + 0.6, cellSize - 1.2, cellSize - 1.2, radius);
              ctx.fill();
            }
          }
        }

        const drawArtisticCornerEye = (startRow: number, startCol: number) => {
          const eyeSize = 7 * cellSize;
          const x = padding + startCol * cellSize;
          const y = padding + startRow * cellSize;

          ctx.strokeStyle = '#0B0B0B';
          ctx.lineWidth = cellSize * 0.95;
          ctx.beginPath();
          ctx.roundRect(x + cellSize * 0.5, y + cellSize * 0.5, eyeSize - cellSize, eyeSize - cellSize, eyeSize * 0.28);
          ctx.stroke();

          ctx.strokeStyle = '#C6A15B';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(x + 1, y + 1, eyeSize - 2, eyeSize - 2, eyeSize * 0.32);
          ctx.stroke();

          ctx.fillStyle = '#C6A15B';
          ctx.beginPath();
          ctx.roundRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize, (3 * cellSize) * 0.3);
          ctx.fill();
        };

        drawArtisticCornerEye(0, 0);
        drawArtisticCornerEye(0, moduleCount - 7);
        drawArtisticCornerEye(moduleCount - 7, 0);

        const badgeSize = 13 * cellSize;
        const badgeX = padding + (moduleCount * cellSize - badgeSize) / 2;
        const badgeY = padding + (moduleCount * cellSize - badgeSize) / 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(badgeX - 10, badgeY - 10, badgeSize + 20, badgeSize + 20, 24);
        ctx.fill();

        ctx.strokeStyle = '#C6A15B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(badgeX - 8, badgeY - 8, badgeSize + 16, badgeSize + 16, 22);
        ctx.stroke();

        ctx.strokeStyle = '#E2C98F';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(badgeX - 2, badgeY - 2, badgeSize + 4, badgeSize + 4, 18);
        ctx.stroke();

        ctx.fillStyle = '#0B0B0B';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 16);
        ctx.fill();

        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.src = '/logo.jpg';
        logo.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(badgeX + 6, badgeY + 6, badgeSize - 12, badgeSize - 12, 12);
          ctx.clip();
          ctx.drawImage(logo, badgeX + 6, badgeY + 6, badgeSize - 12, badgeSize - 12);
          ctx.restore();

          setQrDataUrl(canvas.toDataURL('image/png'));
        };

        setQrDataUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Failed to create creative artistic QR:', err);
      }
    }

    generateLuxuryArtisticQr();
  }, [customUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-luxury-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTargetUrlChange) {
      onTargetUrlChange(customUrl);
    }
  };

  return (
    <div className="qr-container">
      {/* Controls visible only on screen, hidden on print */}
      <div className="print-hide" style={{ width: '100%', maxWidth: '440px', marginBottom: '18px' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 14px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={16} color="var(--gold-primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Standee Controls
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`btn-copy ${variant === 'black' ? 'copied' : ''}`}
                style={{ padding: '4px 8px', fontSize: '0.6875rem' }}
                onClick={() => setVariant('black')}
              >
                Obsidian Gold
              </button>
              <button
                type="button"
                className={`btn-copy ${variant === 'white' ? 'copied' : ''}`}
                style={{ padding: '4px 8px', fontSize: '0.6875rem' }}
                onClick={() => setVariant('white')}
              >
                Pure White
              </button>
            </div>
          </div>

          <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="qr-url-input" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Target review URL:
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                id="qr-url-input"
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-domain.vercel.app"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '16px', // Prevents iOS auto-zoom
                }}
              />
              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: 'auto', minHeight: 'auto', padding: '8px 12px', fontSize: '0.75rem' }}
              >
                Update
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button
              type="button"
              className="btn btn-gold"
              onClick={handlePrint}
              style={{ flex: 1, minHeight: '44px', padding: '10px 14px', fontSize: '0.8rem' }}
            >
              <Printer size={15} />
              <span>Print Sign</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownload}
              style={{ flex: 1, minHeight: '44px', padding: '10px 14px', fontSize: '0.8rem' }}
            >
              <Download size={15} />
              <span>Save PNG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Luxury Counter Standee Card with Mobile-Adaptive Width */}
      <div className={`qr-printable-sheet ${variant === 'white' ? 'white-variant' : ''}`} id="printable-qr-sign">
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <img
            src="/logo.jpg"
            alt={businessName}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              border: '1.5px solid var(--gold-primary)',
              display: 'inline-block',
            }}
          />
        </div>

        <div className="qr-brand-tag" style={{ letterSpacing: '0.18em' }}>
          Exclusive Detailing & Auto Care
        </div>
        <h2 className="qr-business-title">
          {businessName}
        </h2>

        {/* Five Star Accent */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginBottom: '12px', color: '#C6A15B' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={14} fill="#C6A15B" stroke="#C6A15B" />
          ))}
        </div>

        <div className="qr-divider" />

        {/* Mobile Fluid Frame */}
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            margin: '8px 0 18px',
            padding: '12px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '2px solid #C6A15B',
            maxWidth: '100%',
          }}
        >
          {/* Filigree Corner Brackets */}
          <div style={{ position: 'absolute', top: '-5px', left: '-5px', width: '18px', height: '18px', borderTop: '2.5px solid #E2C98F', borderLeft: '2.5px solid #E2C98F', borderRadius: '5px 0 0 0' }} />
          <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', borderTop: '2.5px solid #E2C98F', borderRight: '2.5px solid #E2C98F', borderRadius: '0 5px 0 0' }} />
          <div style={{ position: 'absolute', bottom: '-5px', left: '-5px', width: '18px', height: '18px', borderBottom: '2.5px solid #E2C98F', borderLeft: '2.5px solid #E2C98F', borderRadius: '0 0 0 5px' }} />
          <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '18px', height: '18px', borderBottom: '2.5px solid #E2C98F', borderRight: '2.5px solid #E2C98F', borderRadius: '0 0 5px 0' }} />

          <div className="qr-responsive-box">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`${businessName} Bespoke Luxury QR Code`}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  borderRadius: '10px',
                }}
              />
            ) : (
              <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="spinner" />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Bottom Floating Tag */}
          <div
            style={{
              position: 'absolute',
              bottom: '-11px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#0B0B0B',
              border: '1px solid #C6A15B',
              color: '#E2C98F',
              fontSize: '0.575rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '2px 10px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
            }}
          >
            Instant 1-Tap Review
          </div>
        </div>

        {/* Scan Callout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', marginBottom: '4px' }}>
          <Smartphone size={16} color="#C6A15B" />
          <div className="qr-scan-instruction">
            Point Camera to Review
          </div>
        </div>

        <p className="qr-scan-subtext">
          {scanInstruction || 'Ceramic Coating • Robotics Wash • Bike & Car Detailing'}
        </p>

        <div
          style={{
            marginTop: '22px',
            paddingTop: '14px',
            borderTop: `1px solid ${variant === 'white' ? '#E2E8F0' : '#262118'}`,
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: variant === 'white' ? '#64748B' : '#6B665E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={11} color="var(--gold-primary)" />
          <span>Official Google Review Verification Portal</span>
        </div>
      </div>
    </div>
  );
};
