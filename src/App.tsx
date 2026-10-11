import { useState, useEffect } from 'react';
import { ReviewForm } from './components/ReviewForm';
import { PrintableQr } from './components/PrintableQr';
import { QrCode, MessageSquareHeart } from 'lucide-react';
import { CLIENT_CONFIG } from './config/clientConfig';

export function App() {
  const [activeTab, setActiveTab] = useState<'review' | 'qr'>('review');
  const [businessName, setBusinessName] = useState(CLIENT_CONFIG.businessName);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(CLIENT_CONFIG.googleReviewUrl);
  const [tagline, setTagline] = useState(CLIENT_CONFIG.tagline);
  const [scanInstruction, setScanInstruction] = useState(CLIENT_CONFIG.shortScanInstruction);
  const [targetQrUrl, setTargetQrUrl] = useState<string>('');

  useEffect(() => {
    setTargetQrUrl(window.location.origin);

    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.businessName) setBusinessName(data.businessName);
          if (data.googleReviewUrl) setGoogleReviewUrl(data.googleReviewUrl);
          if (data.tagline) setTagline(data.tagline);
          if (data.shortScanInstruction) setScanInstruction(data.shortScanInstruction);
        }
      })
      .catch((err) => {
        console.warn('Config fetch error, using local fallback:', err);
      });
  }, []);

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="site-header">
        <div className="header-brand">
          <div className="brand-logo-container">
            <img src="/logo.jpg" alt={`${businessName} Logo`} className="brand-logo-img" />
          </div>
          <div className="brand-info">
            <h1>{businessName}</h1>
            <p>DETAILING STUDIO & REPAIRS</p>
          </div>
        </div>

        <nav aria-label="Quick Navigation">
          {activeTab === 'review' ? (
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => setActiveTab('qr')}
              title="View Printable QR Standee"
            >
              <QrCode size={16} />
              <span>Printable QR</span>
            </button>
          ) : (
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => setActiveTab('review')}
              title="Return to Customer Review Form"
            >
              <MessageSquareHeart size={16} />
              <span>Customer Review</span>
            </button>
          )}
        </nav>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {activeTab === 'review' ? (
          <ReviewForm
            businessName={businessName}
            googleReviewUrl={googleReviewUrl}
          />
        ) : (
          <PrintableQr
            businessName={businessName}
            tagline={tagline}
            scanInstruction={scanInstruction}
            targetUrl={targetQrUrl}
            onTargetUrlChange={(newUrl) => setTargetQrUrl(newUrl)}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="site-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '22px', height: '22px', borderRadius: '4px' }} />
          <strong>{businessName}</strong> • Official Customer Review Portal
        </div>
        <div style={{ marginTop: '4px', fontSize: '0.72rem' }}>
          Direct handoff to Google Reviews • Unbiased and independent
        </div>
      </footer>
    </div>
  );
}

export default App;
