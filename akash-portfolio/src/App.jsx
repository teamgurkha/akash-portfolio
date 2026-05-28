import { useState, useEffect, useRef } from "react";

// If you clean up the nested folder later, change this ONE line to '/images'
const IMG = '/images/images';

const T = {
  bg: '#060606', bg1: '#0d0d0d',
  text: '#f0ede6', stone: '#b8b0a4',
  gold: '#c4a064', border: 'rgba(240,237,230,0.07)',
  borderGold: 'rgba(196,160,100,0.20)', card: 'rgba(255,255,255,0.028)',
};

const gold = {
  background: 'linear-gradient(135deg,#9e7c3a,#c4a064,#d4b47a)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
};

const sP = { padding: 'clamp(88px,10vw,144px) clamp(22px,5.5vw,80px)' };
const sLabel = { color: T.gold, letterSpacing: '3.5px', textTransform: 'uppercase', fontSize: '9.5px', marginBottom: '18px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 };
const sH2 = { fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(34px,5.5vw,62px)', fontWeight: 700, lineHeight: 1.07, letterSpacing: '-1.5px' };

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, dir = 'up', style: extraStyle = {} }) {
  const [ref, visible] = useInView();
  const transforms = { up: 'translateY(44px)', left: 'translateX(-36px)', right: 'translateX(36px)' };
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : transforms[dir],
      transition: `opacity .82s ${delay}s ease, transform .82s ${delay}s ease`,
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

function Counter({ end, suffix = '+', prefix = '', label }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useInView(0.35);
  useEffect(() => {
    if (!visible) return;
    const dur = 1900, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - (1 - p) ** 3;
      setVal(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, end]);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '34px 18px' }}>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(40px,5vw,60px)', fontWeight: 700, lineHeight: 1, color: T.gold }}>
        {prefix}{val.toLocaleString()}{suffix}
      </div>
      <div style={{ color: T.stone, fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: '12px', lineHeight: 1.7, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, whiteSpace: 'pre-line' }}>
        {label}
      </div>
    </div>
  );
}

function YouTubeEmbed({ id, label }) {
  return (
    <div>
      {label && <p style={{ color: T.gold, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Space Grotesk',sans-serif" }}>{label}</p>}
      <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
        <iframe src={`https://www.youtube.com/embed/${id}`} style={{ width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={label || id} />
      </div>
    </div>
  );
}

function TwitterEmbed({ url, label }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(ref.current);
    }
  }, []);
  return (
    <div ref={ref}>
      {label && <p style={{ color: T.gold, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Space Grotesk',sans-serif" }}>{label}</p>}
      <blockquote className="twitter-tweet" data-theme="dark" data-conversation="none">
        <a href={url.replace('x.com', 'twitter.com')}>View on X</a>
      </blockquote>
    </div>
  );
}

function EventModal({ ev, onClose }) {
  const initialTab = ev.photos?.length > 0 ? 'photo' : ev.youtube?.length > 0 ? 'youtube' : 'twitter';
  const [tab, setTab] = useState(initialTab);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', fn); };
  }, [onClose]);

  const photos = ev.photos || [];
  const youtube = ev.youtube || [];
  const twitter = ev.twitter || [];
  const tabs = [
    photos.length > 0 && { id: 'photo', label: `Photos (${photos.length})` },
    youtube.length > 0 && { id: 'youtube', label: `YouTube (${youtube.length})` },
    twitter.length > 0 && { id: 'twitter', label: `X / Twitter (${twitter.length})` },
  ].filter(Boolean);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(6,6,6,.96)', backdropFilter: 'blur(22px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px,3vw,40px)', animation: 'fadeIn .28s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#0d0d0d', border: '1px solid rgba(240,237,230,.1)', borderRadius: '18px', maxWidth: '880px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: 'clamp(22px,4vw,48px)', animation: 'slideUp .32s ease' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <div style={{ color: T.gold, fontSize: '9.5px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{ev.tag}</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(20px,4vw,36px)', fontWeight: 700, color: T.text, lineHeight: 1.1 }}>{ev.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(240,237,230,.15)', color: T.stone, borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '16px' }}>✕</button>
        </div>

        {tabs.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? T.gold : 'transparent', border: `1px solid ${tab === t.id ? T.gold : 'rgba(196,160,100,.3)'}`, color: tab === t.id ? '#fff' : T.gold, padding: '6px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Space Grotesk',sans-serif" }}>{t.label}</button>
            ))}
          </div>
        )}

        {tab === 'photo' && photos.length > 0 && (
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', aspectRatio: '16/9', background: `linear-gradient(135deg, ${ev.accent}22, #060606)` }}>
            <img src={photos[imgIdx]} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
            {photos.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + photos.length) % photos.length)} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,6,6,.75)', border: '1px solid rgba(255,255,255,.18)', color: T.text, width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <button onClick={() => setImgIdx(i => (i + 1) % photos.length)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,6,6,.75)', border: '1px solid rgba(255,255,255,.18)', color: T.text, width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                  {photos.map((_, i) => <button key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? '20px' : '7px', height: '7px', borderRadius: '4px', background: i === imgIdx ? T.gold : 'rgba(255,255,255,.3)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .3s' }} />)}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'youtube' && youtube.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
            {youtube.map((v, i) => <YouTubeEmbed key={i} id={v.id} label={v.label} />)}
          </div>
        )}

        {tab === 'twitter' && twitter.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
            {twitter.map((t, i) => <TwitterEmbed key={i} url={t.url} label={t.label} />)}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '24px' }}>
          <p style={{ color: T.stone, fontSize: '14px', lineHeight: 1.82, fontWeight: 300 }}>{ev.description}</p>
          <div>
            <div style={{ color: T.gold, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: "'Space Grotesk',sans-serif" }}>Details</div>
            <p style={{ color: T.stone, fontSize: '13px', lineHeight: 1.8 }}>{ev.meta}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [activeId, setActiveId] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!document.querySelector('script[src*="platform.twitter.com"]')) {
      const tw = document.createElement('script');
      tw.src = 'https://platform.twitter.com/widgets.js';
      tw.async = true;
      tw.charset = 'utf-8';
      document.body.appendChild(tw);
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,500&display=swap';
    document.head.appendChild(link);
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: #060606; color: #f0ede6; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: #060606; }
      ::-webkit-scrollbar-thumb { background: #c4a064; border-radius: 2px; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
      @keyframes heroIn { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
      @keyframes pulseDot { 0%,100% { opacity:.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.5); } }
      @keyframes floatA { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-11px); } }
      @keyframes shimmer { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
      .ev-card { transition: all .38s ease; cursor: pointer; }
      .ev-card:hover { transform: translateY(-7px); box-shadow: 0 30px 70px rgba(0,0,0,.88); border-color: rgba(240,237,230,.13) !important; }
      .ev-img { transition: transform .55s ease; }
      .ev-card:hover .ev-img { transform: scale(1.07); }
      .ev-hint { transition: opacity .3s; opacity: 0; }
      .ev-card:hover .ev-hint { opacity: 1; }
      .nav-btn { background: none; border: none; cursor: pointer; transition: color .22s; position: relative; padding: 4px 0; }
      .nav-btn::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px; background: #c4a064; transition: width .28s; }
      .nav-btn:hover { color: #c4a064 !important; }
      .nav-btn:hover::after { width: 100%; }
      .btn-gold { background: linear-gradient(135deg,#c4a064 0%,#9e7c3a 55%,#c4a064 100%); background-size: 200% 200%; animation: shimmer 4s ease infinite; transition: transform .28s, box-shadow .28s; cursor: pointer; border: none; }
      .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 14px 38px rgba(196,160,100,.34); }
      .btn-out { border: 1px solid rgba(240,237,230,.18); background: transparent; transition: all .28s; cursor: pointer; }
      .btn-out:hover { background: rgba(240,237,230,.05); border-color: rgba(240,237,230,.34); transform: translateY(-2px); }
      .sk-cell { transition: background .28s; cursor: default; }
      .sk-cell:hover { background: rgba(196,160,100,.05) !important; }
      .trait { transition: all .24s; cursor: default; }
      .trait:hover { background: rgba(196,160,100,.1) !important; border-color: rgba(196,160,100,.42) !important; }
      .social-icon { width: 52px; height: 52px; border-radius: 50%; border: 1px solid rgba(196,160,100,.3); background: rgba(196,160,100,.05); display: flex; align-items: center; justify-content: center; color: #c4a064; transition: all .28s; text-decoration: none; }
      .social-icon:hover { background: rgba(196,160,100,.18); border-color: rgba(196,160,100,.6); transform: translateY(-3px); box-shadow: 0 10px 25px rgba(196,160,100,.2); }
      @media (max-width: 860px) {
        .d-none { display: none !important; }
        .hero-wrap { flex-direction: column !important; gap: 36px !important; }
        .ev-grid { grid-template-columns: 1fr !important; }
        .ev-wide { grid-column: span 1 !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - .5) * .00019, vy: (Math.random() - .5) * .00019,
      r: Math.random() * 1.1 + .3, a: Math.random() * .32 + .07,
    }));
    const tick = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x = ((p.x + p.vx) + 1) % 1;
        p.y = ((p.y + p.vy) + 1) % 1;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,160,100,${p.a})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length - 1; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = (pts[i].x - pts[j].x) * W, dy = (pts[i].y - pts[j].y) * H;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 108) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x * W, pts[i].y * H);
            ctx.lineTo(pts[j].x * W, pts[j].y * H);
            ctx.strokeStyle = `rgba(196,160,100,${.07 * (1 - d / 108)})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 44);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const goto = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const navLinks = [
    { l: 'About', id: 'about' }, { l: 'Work', id: 'events' }, { l: 'Impact', id: 'metrics' },
    { l: 'Skills', id: 'skills' }, { l: 'Journey', id: 'timeline' }, { l: 'Contact', id: 'contact' },
  ];

  const events = [
    {
      id: 'bkk', wide: true,
      title: 'Stark Space Bangkok 2024', tag: 'Hacker House + 5-Day Multi Events',
      meta: 'Devcon Week Bangkok · Fig Lobby Buyout · Nov 2024 · 10,000+ Attendees',
      description: 'Seven-day flagship activation during Devcon week in Bangkok. Hacker House, developer workshops, VIP dinners, community parties, yoga & sport experiences, and a full hacker lounge — drawing 10,000+ attendees from the global ETH and Starknet ecosystem.',
      photos: [`${IMG}/bangkok-entrance.jpg`, `${IMG}/bangkok-tunnel.jpg`, `${IMG}/bangkok-lobby.jpg`, `${IMG}/bangkok-cafe.jpg`, `${IMG}/bangkok-team.jpg`, `${IMG}/hackerhouse-bkk.jpg`],
      youtube: [{ id: 'kTbc6aMQWRM', label: 'Bangkok Hacker House — Official Recap' }],
      twitter: [{ url: 'https://twitter.com/_SDAV/status/1856586241858269497', label: 'Yoga Event (Community)' }],
      accent: '#9060e0', icon: '⬡',
    },
    {
      id: 'denver', wide: false,
      title: 'StarkCity Denver + ETH Denver', tag: 'Hacker House + Side Event + Conference Activation',
      meta: 'ETH Denver · 2024 & 2025 · Multiple Venues · 1,000+ Attendees',
      description: 'Large-scale activation at ETH Denver 2024 — multiple venues, booth management, speakers, sponsors, workshops, and community programming. Preceded by the Denver Hacker House.',
      photos: [`${IMG}/denver-panel.jpg`, `${IMG}/denver-crowd.jpg`, `${IMG}/denver-fireside.jpg`, `${IMG}/denver-hackerhouse-sign.jpg`, `${IMG}/denver-hackerhouse-coding.jpg`],
      youtube: [
        { id: 'rPJwyUlp2ik', label: 'StarkCity Denver — Conference Recap' },
        { id: '6Njz6Ppk1mI', label: 'Denver Hacker House 2025 — Post Movie' },
      ],
      twitter: [{ url: 'https://twitter.com/starknet_anon/status/1761494109582180662', label: 'Denver Hacker House 2024' }],
      accent: '#7080ff', icon: '◎',
    },
    {
      id: 'london', wide: false,
      title: 'StarkCity London', tag: 'Conference Activation',
      meta: 'London Blockchain Week · Full-Day Event · Waterloo Station · 300+ Attendees',
      description: "Starknet's conference presence during London Blockchain Week — workshops, ecosystem panels, and community gatherings bringing together builders across the UK and Europe.",
      photos: [`${IMG}/london-speaker.jpg`, `${IMG}/london-talk.jpg`, `${IMG}/london-panel.jpg`, `${IMG}/london-crowd.jpg`, `${IMG}/london-venue.jpg`, `${IMG}/london-pub.jpg`],
      youtube: [{ id: 'oF3D76e1mS0', label: 'StarkCity London — Official Recap' }],
      twitter: [],
      accent: '#42c492', icon: '◇',
    },
    {
      id: 'istanbul', wide: false,
      title: 'Hacker House + StarknetCC Istanbul', tag: 'Hacker House + Side Event + Conference Activation',
      meta: 'Devconnect 2023 Istanbul · NH Hotel · Istanbul Congress Center · 200+ Developers · 400+ Attendees',
      description: 'Flagship Hacker House during Devconnect 2023. Onboarded 200+ developers into the Starknet ecosystem through hands-on workshops, mentorship, and collaborative building sessions. Followed by StarknetCC.',
      photos: [`${IMG}/istanbul-hackerhouse.jpg`, `${IMG}/istanbul-venue.jpg`],
      youtube: [],
      twitter: [
        { url: 'https://twitter.com/StarknetFndn/status/1731617290737905837', label: 'Hacker House Istanbul' },
        { url: 'https://twitter.com/Gurk_TV/status/1723967567591612647', label: 'StarknetCC Istanbul — Conference' },
      ],
      accent: '#b070e8', icon: '⬣',
    },
    {
      id: 'brussels', wide: false,
      title: 'Hacker House + StarknetCC Brussels', tag: 'Hacker House + Side Event + Conference Activation',
      meta: 'EthCC 2024 · Brussels · 450+ Attendees',
      description: 'Multi-day Hacker House during EthCC in Brussels — connecting developers, builders, and ecosystem contributors through immersive programming and workshops. Followed by StarknetCC.',
      photos: [`${IMG}/brussels-hackerhouse.jpg`, `${IMG}/brussels-hackerhouse-talk.jpg`, `${IMG}/brussels-hackerhouse-mentor.jpg`, `${IMG}/brussels-workshop.jpg`, `${IMG}/brussels-conf-stage.jpg`, `${IMG}/brussels-conf-keynote.jpg`, `${IMG}/Brussels-Ethcc.jpg`],
      youtube: [], twitter: [], accent: '#60aad8', icon: '◆',
    },
    {
      id: 'bangalore', wide: false,
      title: 'Hacker House Bangalore 2024', tag: 'Hacker House + Conference Booth',
      meta: 'Indian Blockchain Week Bangalore · Late 2024 · 70+ Devs',
      description: "Hacker House in Bangalore at the end of 2024 — bringing the Starknet developer experience to India's thriving tech hub. Hands-on coding sessions, technical talks, and mentorship connecting local builders with the global ecosystem.",
      photos: [`${IMG}/bangalore-hackerhouse-talk.jpg`, `${IMG}/bangalore-hackerhouse-coding.jpg`, `${IMG}/bangalore-corridor.jpg`],
      youtube: [], twitter: [], accent: '#e0a040', icon: '⬢',
    },
    {
      id: 'seoul', wide: false,
      title: 'Stark Space Seoul 2024', tag: 'Community Side Event',
      meta: 'Korea Blockchain Week · Seoul · 2024 · 300+ Attendees',
      description: 'Community-focused event during Korea Blockchain Week — bringing together Starknet developers, founders, and ecosystem partners for immersive collaboration. Featured creative activations such as AI music and a custom Stark Space claw machine.',
      photos: [`${IMG}/seoul-bar.jpg`, `${IMG}/seoul-claw.jpg`],
      youtube: [], twitter: [], accent: '#42c4d4', icon: '◈',
    },
    {
      id: 'berlin', wide: false,
      title: 'Starknet VIP Events', tag: 'Executive Dinners & Rooftop Gatherings',
      meta: 'Global · Curated Experiences',
      description: 'Intimate executive dinners and exclusive rooftop gatherings for ecosystem leaders, investors, and core contributors. White-glove hospitality instincts applied to Web3.',
      photos: [`${IMG}/berlin-rooftop-sunset-vip.jpg`, `${IMG}/berlin-rooftop-vip.jpg`, `${IMG}/berlin-flowers-vip.jpg`, `${IMG}/vip-rooftop-day.jpg`, `${IMG}/vip-dinner.jpg`, `${IMG}/bangkok-night-vip.jpg`],
      youtube: [], twitter: [], accent: '#d4a860', icon: '◆',
    },
    {
      id: 'meetups', wide: false,
      title: 'Global Meetup Network', tag: 'Community at Scale',
      meta: '40+ Cities · Worldwide · 2023–2024',
      description: 'Scaled and managed a global community meetup program across 40+ cities worldwide. From Berlin to Africa, established local event templates, recruited organizers, and delivered consistent brand experiences globally.',
      photos: [`${IMG}/meetup-berlin-talk.jpg`, `${IMG}/meetup-conference.jpg`, `${IMG}/meetup-africa-talk.jpg`, `${IMG}/meetup-africa-group.jpg`],
      youtube: [],
      twitter: [{ url: 'https://twitter.com/Gurk_TV/status/1707447442969342453', label: 'Vienna Meetup — Kickoff' }],
      accent: '#d4a840', icon: '◉',
    },
    {
      id: 'merch', wide: false,
      title: 'Branded Merchandise Program', tag: 'Brand Activation',
      meta: '15,000+ Items · Globally Curated & Delivered',
      description: 'Designed, sourced, and delivered 15,000+ branded merchandise items across global events. From custom incense sticks, glasses, and clothing to LED screens in Bangkok and a branded fan in Seoul — every item a deliberate brand touchpoint.',
      photos: [`${IMG}/merch-hoodie.jpg`, `${IMG}/bangkok-merch.jpg`, `${IMG}/bangkok-swag.jpg`],
      youtube: [],
      twitter: [{ url: 'https://twitter.com/ChadWestTweets/status/1855849509412389121', label: 'Merch (Community Reaction)' }],
      accent: '#e06a6a', icon: '◈',
    },
  ];

  const metrics = [
    { end: 4, prefix: '$', suffix: 'M+', label: 'Event Budget\nManaged' },
    { end: 10000, prefix: '', suffix: '+', label: 'Attendees\nEngaged' },
    { end: 5, prefix: '', suffix: '', label: 'Continents\nReached' },
    { end: 200, prefix: '', suffix: '+', label: 'Developers\nOnboarded' },
    { end: 40, prefix: '', suffix: '+', label: 'Communities &\nMeetups Scaled' },
    { end: 32, prefix: '', suffix: '+', label: 'Side Events\nProduced' },
    { end: 500, prefix: '', suffix: '+', label: 'Speakers &\nFounders' },
    { end: 15000, prefix: '', suffix: '+', label: 'Branded Assets\nDelivered' },
    { end: 10, prefix: '', suffix: '+', label: 'Intl Conferences\n(Devcon · EthCC · Token2049)' },
  ];

  const skills = [
    { n: '01', title: 'Event Strategy & Execution', tags: ['Hacker Houses', 'Conferences', 'Side Events'], body: 'Full-cycle production from concept to wrap. Flagship conferences, intimate gatherings, multi-day developer programs — always on-time, on-brand, on-budget.' },
    { n: '02', title: 'VIP & Executive Experiences', tags: ['White-Glove', 'Dinners'], body: 'Five-star hospitality instincts applied to Web3. Crafting bespoke executive moments where first impressions and lasting impressions are equally deliberate.' },
    { n: '03', title: 'Global Logistics & Operations', tags: ['30+ Cities', '5 Continents'], body: 'End-to-end management across international venues, vendors, visas, and teams. Complex logistics made invisible to the attendee.' },
    { n: '04', title: 'Community Growth & Programs', tags: ['Developer Programs', '40+ Meetups'], body: 'Building ecosystems that outlive the event itself. Structured meetup programs, community playbooks, and developer onboarding at global scale.' },
    { n: '05', title: 'Brand Experience & Storytelling', tags: ['Experiential Design', 'Merchandise'], body: 'Translating organizational values into physical moments — environmental branding to 15,000+ curated merchandise items delivered worldwide.' },
    { n: '06', title: 'Partnerships & Stakeholders', tags: ['Sponsors', 'Ecosystem Partners'], body: 'Cultivating sponsor and partner relationships that amplify reach, add value, and generate measurable co-marketing outcomes.' },
    { n: '07', title: 'Data-Driven Reporting & ROI', tags: ['KPIs', 'Post-Event Analysis'], body: 'Analytical discipline from institutional finance applied to event metrics. Clear reporting, continuous optimization, demonstrable returns.' },
    { n: '08', title: 'Speaker & Talent Coordination', tags: ['500+ Coordinated', 'Global Network'], body: 'Managing speakers, founders, investors, and thought leaders — from green room to stage, every touchpoint considered.' },
  ];

  const traits = ['Calm under pressure', 'Culturally adaptable', 'High taste level', 'Analytically sharp', 'Creatively driven', 'Relationship-first', 'Detail obsessed', 'Globally minded', 'Resilient', 'Game-theorist strategist'];

  const timeline = [
    { year: '2016–18', role: 'Luxury Hospitality & VIP Operations', org: 'Hotel Sacher Wien', type: 'Hospitality', color: T.gold, body: "Vienna's most iconic five-star hotel. Built impeccable white-glove service standards and VIP guest operations at the highest level." },
    { year: '2018–19', role: 'Premium Events & Luxury Catering', org: 'DO&CO', type: 'Hospitality', color: T.gold, body: 'International luxury hospitality and event catering group. High-profile events, elite service delivery, consistently elevated brand touchpoints.' },
    { year: '2019–20', role: 'VIP Guest Relations', org: 'Hotel Bristol Vienna', type: 'Hospitality', color: T.gold, body: 'Leading five-star Starwood property. Refined white-glove protocols, senior executive hospitality, personalized bespoke service at scale.' },
    { year: '2020–21', role: 'VIP Matchday Operations', org: 'Allianz Arena München', type: 'Hospitality', color: T.gold, body: "Premium matchday VIP operations at one of Europe's most iconic sports venues — serving executives, sponsors, and high-profile clients." },
    { year: '2021–22', role: 'Multi-Asset Broker / Trader', org: 'BNP Paribas', type: 'Finance', color: '#7ab4d4', body: 'Institutional brokerage across equities, fixed income, and derivatives. High-stakes analytical decision-making in volatile market environments.' },
    { year: '2022–23', role: 'Ecosystem & Events Lead', org: 'LFG Labs', type: 'Web3', color: '#9a7ae0', body: 'Led community growth and event programming in the early Web3 space, scaling developer and founder engagement through curated in-person experiences.' },
    { year: '2023–Now', role: 'Global Events & Hacker House Program', org: 'Starknet Foundation', type: 'Web3', color: '#9a7ae0', body: 'Co-led flagship Hacker House program across 6 countries. Delivered StarknetCC, Devcon activations, VIP events, and a global meetup network across 30+ cities and 5 continents.' },
  ];

  const activeEvent = events.find(e => e.id === activeId);

  return (
    <div style={{ fontFamily: "'Space Grotesk',sans-serif", background: T.bg, color: T.text, overflowX: 'hidden' }}>
      {activeEvent && <EventModal ev={activeEvent} onClose={() => setActiveId(null)} />}

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: '66px', padding: '0 clamp(20px,5vw,72px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(6,6,6,.95)' : 'transparent', backdropFilter: scrolled ? 'blur(26px)' : 'none', borderBottom: scrolled ? `1px solid ${T.border}` : 'none', transition: 'all .38s ease' }}>
        <button onClick={() => goto('hero')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 400, color: T.text }}>Akash <span style={{ color: T.gold }}>Schweiger</span></span>
        </button>
        <div className="d-none" style={{ display: 'flex', gap: '28px' }}>
          {navLinks.map(l => (
            <button key={l.id} className="nav-btn" onClick={() => goto(l.id)} style={{ color: T.stone, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>{l.l}</button>
          ))}
        </div>
        <button className="btn-gold d-none" onClick={() => goto('contact')} style={{ padding: '10px 22px', borderRadius: '3px', color: '#fff', fontSize: '10.5px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Get In Touch</button>
      </nav>

      <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 60% at 30% 60%, rgba(196,160,100,.055), transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '240px', background: `linear-gradient(to top, ${T.bg}, transparent)` }} />
        <div className="hero-wrap" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: 'clamp(80px,12vw,140px) clamp(24px,6vw,88px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '60px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ animation: 'heroIn .8s ease both', marginBottom: '44px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '5px', height: '5px', background: T.gold, borderRadius: '50%', animation: 'pulseDot 2.2s infinite', display: 'inline-block' }} />
              <span style={{ color: T.stone, fontSize: '10.5px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 500 }}>Salzburg, Austria · Global Event Strategist</span>
            </div>
            <div style={{ animation: 'heroIn .85s .13s ease both', marginBottom: '28px' }}>
              <h1 style={{ fontSize: 'clamp(52px,8.5vw,108px)', fontWeight: 700, lineHeight: .95, letterSpacing: '-4px', color: T.text, textTransform: 'uppercase' }}>IDEAS ARE<br />COMMON.</h1>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(38px,6.5vw,80px)', fontWeight: 300, lineHeight: 1.1, fontStyle: 'italic', letterSpacing: '-2px', marginTop: '6px', ...gold }}>Execution is rare.</p>
            </div>
            <p style={{ fontSize: 'clamp(14px,1.7vw,17px)', color: T.stone, maxWidth: '500px', lineHeight: 1.82, fontWeight: 300, marginBottom: '50px', animation: 'heroIn .85s .28s ease both' }}>
              Global event strategist blending Web3, finance, and luxury hospitality. Combining disciplined execution with creative thinking to build high-impact experiences, communities, and relationships.
            </p>
            <div style={{ display: 'flex', gap: '13px', flexWrap: 'wrap', animation: 'heroIn .85s .44s ease both' }}>
              <button className="btn-gold" onClick={() => goto('events')} style={{ padding: '15px 36px', borderRadius: '3px', color: '#fff', fontSize: '11px', letterSpacing: '2.2px', textTransform: 'uppercase', fontWeight: 600 }}>View My Work</button>
              <button className="btn-out" onClick={() => goto('contact')} style={{ padding: '15px 36px', borderRadius: '3px', color: T.text, fontSize: '11px', letterSpacing: '2.2px', textTransform: 'uppercase', fontWeight: 400 }}>Get In Touch</button>
            </div>
          </div>
          <div className="d-none" style={{ flexShrink: 0, animation: 'heroIn .85s .22s ease both', position: 'relative' }}>
            <div style={{ width: 'clamp(300px,28vw,420px)', height: 'clamp(360px,33vw,500px)', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid rgba(196,160,100,.28)', boxShadow: '0 0 0 8px rgba(196,160,100,.04), 0 30px 80px rgba(0,0,0,.7), 0 0 60px rgba(196,160,100,.1)', position: 'relative', zIndex: 2, background: '#0d0d0d' }}>
              <img src={`${IMG}/sofa.jpg`} alt="Akash Schweiger" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(6,6,6,.85), transparent)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                <div style={{ color: T.gold, fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>The Strategist</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 400, color: T.text, fontStyle: 'italic' }}>Akash Schweiger</div>
              </div>
            </div>
            <div style={{ position: 'absolute', inset: '-14px', borderRadius: '14px', border: '1px solid rgba(196,160,100,.09)', animation: 'floatA 5.5s ease-in-out infinite', pointerEvents: 'none' }} />
          </div>
        </div>
      </section>

      <section id="about" style={{ ...sP, background: T.bg1 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Reveal style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '76px', gap: '40px', flexWrap: 'wrap' }}>
            <div>
              <p style={sLabel}>The Craft</p>
              <h2 style={sH2}>What I Do<br /><em style={{ fontStyle: 'italic', fontFamily: "'Cormorant Garamond',serif", fontWeight: 300 }}>Best.</em></h2>
            </div>
            <p style={{ color: T.stone, maxWidth: '370px', lineHeight: 1.82, fontSize: '14px', fontWeight: 300 }}>Seven years across luxury hospitality, institutional finance, and Web3. Three worlds. One operating principle: execution over everything.</p>
          </Reveal>
          <div id="skills" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1px', background: T.border, borderRadius: '14px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
            {skills.map((s, i) => (
              <Reveal key={i} delay={(i % 4) * .06}>
                <div className="sk-cell" style={{ padding: '34px 28px', background: T.bg1, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: T.gold, letterSpacing: '1px' }}>{s.n}</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {s.tags.map(t => <span key={t} style={{ background: 'rgba(196,160,100,.07)', border: '1px solid rgba(196,160,100,.14)', borderRadius: '20px', padding: '2px 10px', fontSize: '9.5px', color: T.gold }}>{t}</span>)}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '11px', lineHeight: 1.25, color: T.text }}>{s.title}</h3>
                  <p style={{ color: T.stone, fontSize: '13px', lineHeight: 1.74, fontWeight: 300 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="events" style={{ ...sP }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Reveal style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <p style={sLabel}>Selected Work</p>
              <h2 style={sH2}>Event Experiences</h2>
            </div>
            <p style={{ color: T.stone, fontSize: '11.5px', letterSpacing: '1px' }}>Click any event to explore ↗</p>
          </Reveal>
          <div className="ev-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
            {events.map((ev, i) => (
              <Reveal key={ev.id} delay={(i % 3) * .06} style={ev.wide ? { gridColumn: 'span 2' } : {}}>
                <div className="ev-card" onClick={() => setActiveId(ev.id)} style={{ border: `1px solid ${T.border}`, borderRadius: '12px', overflow: 'hidden', height: ev.wide ? '380px' : '275px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', background: '#0d0d0d' }}>
                  <div className="ev-img" style={{ position: 'absolute', inset: 0 }}>
                    {ev.photos && ev.photos.length > 0
                      ? <img src={ev.photos[0]} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .55 }} onError={(e) => { e.target.style.display = 'none'; }} />
                      : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${ev.accent}20 0%, ${ev.accent}07 50%, #060606 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: ev.wide ? '140px' : '100px', opacity: .06, color: ev.accent, lineHeight: 1 }}>{ev.icon}</span>
                        </div>
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,6,6,.97) 28%, rgba(6,6,6,.35) 65%, rgba(6,6,6,.08) 100%)' }} />
                  </div>
                  <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '6px' }}>
                    {ev.youtube?.length > 0 && (
                      <div style={{ background: 'rgba(6,6,6,.8)', border: `1px solid ${ev.accent}40`, borderRadius: '20px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill={ev.accent}><path d="M8 5v14l11-7z" /></svg>
                        <span style={{ color: ev.accent, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>YT</span>
                      </div>
                    )}
                    {ev.twitter?.length > 0 && (
                      <div style={{ background: 'rgba(6,6,6,.8)', border: `1px solid ${ev.accent}40`, borderRadius: '20px', padding: '4px 10px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: ev.accent, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>X</span>
                      </div>
                    )}
                  </div>
                  <div className="ev-hint" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', border: '1px solid rgba(240,237,230,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text, fontSize: '18px' }}>↗</div>
                  </div>
                  <div style={{ position: 'relative', padding: '22px' }}>
                    <div style={{ display: 'inline-block', background: `${ev.accent}16`, border: `1px solid ${ev.accent}2e`, borderRadius: '20px', padding: '4px 13px', marginBottom: '11px' }}>
                      <span style={{ color: ev.accent, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>{ev.tag}</span>
                    </div>
                    <h3 style={{ fontSize: ev.wide ? '24px' : '19px', fontWeight: 700, marginBottom: '7px', lineHeight: 1.15 }}>{ev.title}</h3>
                    <p style={{ color: T.stone, fontSize: '12px' }}>{ev.meta}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="metrics" style={{ ...sP, background: T.bg1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(196,160,100,.04), transparent 65%)' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '72px' }}>
            <p style={sLabel}>By the Numbers</p>
            <h2 style={{ ...sH2, textTransform: 'uppercase' }}>IMPACT AT SCALE</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(175px,1fr))', gap: '1px', background: T.border, borderRadius: '14px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
            {metrics.map((m, i) => (
              <div key={i} style={{ background: T.bg1 }}>
                <Counter end={m.end} prefix={m.prefix} suffix={m.suffix} label={m.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sP, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <div style={{ width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(196,160,100,.32)', boxShadow: '0 0 0 8px rgba(196,160,100,.04), 0 0 40px rgba(196,160,100,.18), 0 20px 50px rgba(0,0,0,.5)', background: '#0d0d0d' }}>
                <img src={`${IMG}/headshot.jpg`} alt="Akash Schweiger" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <p style={sLabel}>The Person Behind the Work</p>
          </Reveal>
          <Reveal delay={.1}>
            <blockquote style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(21px,3.8vw,42px)', fontWeight: 300, lineHeight: 1.5, fontStyle: 'italic', marginBottom: '52px', marginTop: '14px', color: T.text }}>
              "I don't just organize events.<br />I create experiences people remember.<br />The kind that build relationships, inspire action,<br />and leave guests saying, <span style={{ ...gold, fontStyle: 'normal' }}>"That was dope."</span>"
            </blockquote>
          </Reveal>
          <Reveal delay={.18}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '52px' }}>
              {traits.map((t, i) => (
                <div key={i} className="trait" style={{ background: 'rgba(196,160,100,.05)', border: '1px solid rgba(196,160,100,.16)', borderRadius: '40px', padding: '9px 18px', fontSize: '12.5px', color: T.text }}>{t}</div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={.26}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
              {[['📍', 'Salzburg, Austria'], ['🌐', 'German · English · Nepali'], ['🎭', "BJJ · Freediving · DJ'ing · Meditation"]].map(([icon, lbl]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '9px', color: T.stone, fontSize: '13px' }}><span>{icon}</span><span>{lbl}</span></div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="timeline" style={{ ...sP, background: T.bg1 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={sLabel}>Career Path</p>
            <h2 style={sH2}>The Journey</h2>
          </Reveal>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: `linear-gradient(to bottom, transparent, ${T.gold}44 15%, ${T.gold}44 85%, transparent)`, transform: 'translateX(-50%)' }} />
            {timeline.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <Reveal key={i} delay={i * .08} dir={isLeft ? 'left' : 'right'}>
                  <div style={{ display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', marginBottom: '34px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '50%', top: '24px', transform: 'translateX(-50%)', width: '13px', height: '13px', background: item.color, borderRadius: '50%', border: `2.5px solid ${T.bg1}`, zIndex: 10, boxShadow: `0 0 16px ${item.color}60` }} />
                    <div style={{ width: '44%', background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '24px 22px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: `linear-gradient(to right, transparent, ${item.color}48, transparent)` }} />
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: item.color, fontWeight: 600 }}>{item.type}</span>
                        <span style={{ color: T.stone, fontSize: '10px' }}>· {item.year}</span>
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '5px' }}>{item.role}</h3>
                      <p style={{ color: T.gold, fontSize: '12px', marginBottom: '11px', fontWeight: 500 }}>{item.org}</p>
                      <p style={{ color: T.stone, fontSize: '12.5px', lineHeight: 1.7, fontWeight: 300 }}>{item.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact" style={{ ...sP, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <Reveal>
            <div style={{ width: '50px', height: '1px', background: T.gold, margin: '0 auto 38px' }} />
            <p style={sLabel}>Let's Connect</p>
          </Reveal>
          <Reveal delay={.1}>
            <h2 style={{ ...sH2, fontSize: 'clamp(30px,6vw,64px)', marginBottom: '24px' }}>
              Perception fades. Reality remains.<br />
              <em style={{ fontStyle: 'italic', fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, ...gold }}>Let's build what lasts.</em>
            </h2>
          </Reveal>
          <Reveal delay={.18}>
            <p style={{ color: T.stone, fontSize: '16px', fontWeight: 300, lineHeight: 1.78, marginBottom: '48px' }}>Available for event strategy, experiential marketing, community, partnerships, and global operations roles worldwide.</p>
          </Reveal>
          <Reveal delay={.26}>
            <div style={{ background: T.card, border: `1px solid ${T.borderGold}`, borderRadius: '14px', padding: 'clamp(28px,4vw,48px)', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '28px' }}>
              {[
                ['Name', 'Akash Schweiger'],
                ['Location', 'Salzburg, Austria'],
                ['Email', 'Crypto_Gurkha@Proton.me'],
                ['Telegram', '@crypto_gurkha'],
                ['Languages', 'German · English · Nepali'],
              ].map(([l, v]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ color: T.gold, fontSize: '9.5px', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '9px' }}>{l}</div>
                  <div style={{ color: T.text, fontSize: '13.5px', fontWeight: 300 }}>{v}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={.3}>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginBottom: '32px' }}>
              <a href="mailto:Crypto_Gurkha@Proton.me" className="social-icon" title="Email" aria-label="Email">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
              <a href="https://t.me/crypto_gurkha" target="_blank" rel="noopener noreferrer" className="social-icon" title="Telegram: @crypto_gurkha" aria-label="Telegram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.27 1.4.18 1.12 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.11-3.03-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
              </a>
              <a href="https://x.com/Gurk_TV" target="_blank" rel="noopener noreferrer" className="social-icon" title="X: @Gurk_TV" aria-label="X / Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              </a>
            </div>
          </Reveal>
          <Reveal delay={.36}>
            <a href="mailto:Crypto_Gurkha@Proton.me" className="btn-gold" style={{ display: 'inline-block', padding: '17px 50px', borderRadius: '3px', color: '#fff', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none' }}>Send a Message →</a>
          </Reveal>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '26px clamp(22px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '17px' }}>Akash <span style={{ color: T.gold }}>Schweiger</span></span>
        <span style={{ color: T.stone, fontSize: '11px', letterSpacing: '1px' }}>Global Event Strategist · Salzburg, Austria · {new Date().getFullYear()}</span>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <a href="https://x.com/Gurk_TV" target="_blank" rel="noopener noreferrer" style={{ color: T.stone, transition: 'color .25s' }} title="X" onMouseOver={e => e.currentTarget.style.color = T.gold} onMouseOut={e => e.currentTarget.style.color = T.stone}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
          </a>
          <a href="https://t.me/crypto_gurkha" target="_blank" rel="noopener noreferrer" style={{ color: T.stone, transition: 'color .25s' }} title="Telegram" onMouseOver={e => e.currentTarget.style.color = T.gold} onMouseOut={e => e.currentTarget.style.color = T.stone}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.27 1.4.18 1.12 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.11-3.03-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
          </a>
          <a href="mailto:Crypto_Gurkha@Proton.me" style={{ color: T.stone, fontSize: '12px', textDecoration: 'none', transition: 'color .25s' }} onMouseOver={e => e.currentTarget.style.color = T.gold} onMouseOut={e => e.currentTarget.style.color = T.stone}>Crypto_Gurkha@Proton.me</a>
        </div>
      </footer>
    </div>
  );
}
