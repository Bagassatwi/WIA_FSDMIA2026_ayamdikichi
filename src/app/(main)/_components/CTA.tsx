import Link from 'next/link'

function CTA() {
  return (
    <section className="section final">
      <svg
        className="art"
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#fff" strokeOpacity=".1">
          <line x1="0" y1="0" x2="0" y2="300" />
          <line x1="60" y1="0" x2="60" y2="300" />
          <line x1="120" y1="0" x2="120" y2="300" />
          <line x1="180" y1="0" x2="180" y2="300" />
          <line x1="240" y1="0" x2="240" y2="300" />
          <line x1="300" y1="0" x2="300" y2="300" />
          <line x1="360" y1="0" x2="360" y2="300" />
          <line x1="420" y1="0" x2="420" y2="300" />
          <line x1="480" y1="0" x2="480" y2="300" />
          <line x1="540" y1="0" x2="540" y2="300" />
          <line x1="600" y1="0" x2="600" y2="300" />
          <line x1="660" y1="0" x2="660" y2="300" />
          <line x1="720" y1="0" x2="720" y2="300" />
          <line x1="780" y1="0" x2="780" y2="300" />
          <line x1="840" y1="0" x2="840" y2="300" />
          <line x1="900" y1="0" x2="900" y2="300" />
          <line x1="960" y1="0" x2="960" y2="300" />
          <line x1="1020" y1="0" x2="1020" y2="300" />
          <line x1="1080" y1="0" x2="1080" y2="300" />
          <line x1="1140" y1="0" x2="1140" y2="300" />
          <line x1="1200" y1="0" x2="1200" y2="300" />
          <line x1="0" y1="0" x2="1200" y2="0" />
          <line x1="0" y1="60" x2="1200" y2="60" />
          <line x1="0" y1="120" x2="1200" y2="120" />
          <line x1="0" y1="180" x2="1200" y2="180" />
          <line x1="0" y1="240" x2="1200" y2="240" />
          <line x1="0" y1="300" x2="1200" y2="300" />
        </g>
        <polyline
          fill="none"
          stroke="#fff"
          strokeOpacity=".5"
          strokeWidth="3"
          strokeDasharray="10 9"
          points="120,240 360,180 540,220 780,120 960,160 1140,60"
        />
        <circle cx="120" cy="240" r="9" fill="#fff" fillOpacity=".9" />
        <circle cx="120" cy="240" r="22" fill="none" stroke="#fff" strokeOpacity=".3" />
        <circle cx="360" cy="180" r="9" fill="#fff" fillOpacity=".9" />
        <circle cx="360" cy="180" r="22" fill="none" stroke="#fff" strokeOpacity=".3" />
        <circle cx="540" cy="220" r="9" fill="#fff" fillOpacity=".9" />
        <circle cx="540" cy="220" r="22" fill="none" stroke="#fff" strokeOpacity=".3" />
        <circle cx="780" cy="120" r="9" fill="#fff" fillOpacity=".9" />
        <circle cx="780" cy="120" r="22" fill="none" stroke="#fff" strokeOpacity=".3" />
        <circle cx="960" cy="160" r="9" fill="#fff" fillOpacity=".9" />
        <circle cx="960" cy="160" r="22" fill="none" stroke="#fff" strokeOpacity=".3" />
        <circle cx="1140" cy="60" r="9" fill="#fff" fillOpacity=".9" />
        <circle cx="1140" cy="60" r="22" fill="none" stroke="#fff" strokeOpacity=".3" />
      </svg>
      <div className="wrap final-in">
        <div>
          <h2>Mulai dari satu laporan.</h2>
          <p>Laporan yang jelas dan terdokumentasi membuat penanganan bisa dipantau bersama.</p>
        </div>
        <div className="cta-row">
          <Link className="btn btn-light" href="/buat-laporan">
            Buat Laporan
          </Link>
          <Link className="btn btn-primary" style={{ background: "#1E40AF" }} href="/laporan">
            Jelajahi Laporan
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTA