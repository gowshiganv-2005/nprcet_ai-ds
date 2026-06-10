import { useEffect, useRef, useState } from 'react'
import './App.css'
import adLogo from './assets/logo.png'
const bgVideo = "https://media.githubusercontent.com/media/gowshiganv-2005/nprcet_ai-ds/main/src/assets/video.mp4";

const topImages = [
  "/carousel/IMG_20260603_183910.jpg",
  "/carousel/IMG_20260603_183923.jpg",
  "/carousel/IMG_20260603_183933.jpg",
  "/carousel/IMG_20260603_183947.jpg",
  "/carousel/IMG_20260603_183957.jpg",
  "/carousel/IMG_20260603_184006.jpg",
  "/carousel/IMG_20260603_184017.jpg",
  "/carousel/IMG_20260603_184245.jpg"
]

const bottomImages = [
  "/carousel/IMG_20260603_184256.jpg",
  "/carousel/IMG_20260603_184309.jpg",
  "/carousel/IMG_20260603_184319.jpg",
  "/carousel/IMG_20260603_184328.jpg",
  "/carousel/IMG_20260603_184337.jpg",
  "/carousel/IMG_20260603_184353.jpg",
  "/carousel/IMG_20260603_184508.jpg"
]

/* ══════════════════════════════════════════
   SCROLL REVEAL HOOK
══════════════════════════════════════════ */
function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12, ...options }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, visible]
}

/* ══════════════════════════════════════════
   NEURAL NETWORK — section-local parallax
══════════════════════════════════════════ */
function NeuralParallax() {
  const canvasRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let W, H
    let particles = []
    let mouse = { x: -9999, y: -9999 }

    const NODE_COLOR  = 'rgba(107, 0, 87,'
    const LINE_COLOR  = 'rgba(150, 60, 160,'
    const BG_TOP      = '#FAFAFA'
    const BG_BOT      = '#F5F0FA'

    const COUNT = 180
    const DIST  = 180

    function resize() {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    class Particle {
      constructor() { this.spawn() }
      spawn() {
        this.x  = Math.random() * W
        this.y  = Math.random() * H
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.r  = Math.random() * 2.2 + 0.6
        this.a  = Math.random() * 0.55 + 0.2
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < 0 || this.x > W) this.vx *= -1
        if (this.y < 0 || this.y > H) this.vy *= -1
        const dx = this.x - mouse.x
        const dy = this.y - mouse.y
        const d  = Math.hypot(dx, dy)
        if (d < 100) { this.x += dx * 0.025; this.y += dy * 0.025 }
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = NODE_COLOR + this.a + ')'
        ctx.fill()
      }
    }

    function buildParticles() {
      particles = []
      for (let i = 0; i < COUNT; i++) particles.push(new Particle())
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x
          const dy   = particles[i].y - particles[j].y
          const dist = Math.hypot(dx, dy)
          if (dist < DIST) {
            const a = (1 - dist / DIST) * 0.45
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = LINE_COLOR + a + ')'
            ctx.lineWidth   = 0.85
            ctx.stroke()
          }
        }
      }
    }

    function animate() {
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, BG_TOP)
      grad.addColorStop(1, BG_BOT)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
      particles.forEach(p => { p.update(); p.draw() })
      drawLines()
      animId = requestAnimationFrame(animate)
    }

    function onScroll() {
      if (!section || !canvas) return
      const rect         = section.getBoundingClientRect()
      const sectionH     = section.offsetHeight
      const viewH        = window.innerHeight
      const progress     = -(rect.top - viewH) / (sectionH + viewH)
      const maxShift = sectionH * 0.2
      const shift    = (progress - 0.5) * maxShift * 0.9
      canvas.style.transform = `translateY(${shift}px)`
    }

    resize()
    buildParticles()
    animate()

    window.addEventListener('resize', () => { resize(); buildParticles() })
    window.addEventListener('scroll', onScroll, { passive: true })
    section.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    })
    section.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999 })

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className="neural-hero" ref={sectionRef}>
      <canvas ref={canvasRef} className="neural-canvas" />
      <div className="ranking-text">
        <h1 className="title">
          Future's Leading AI 
          <span className="title-accent">Department</span>
        </h1>
        <div className="hero-divider" />
        <p className="subtitle">Where NPRCET Grow to Change the World</p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   MARQUEE
══════════════════════════════════════════ */
function Marquee({ imgList, direction = 'normal', speed = '38s' }) {
  return (
    <div className="marquee-container">
      <div
        className="marquee-content"
        style={{ animationDirection: direction, animationDuration: speed }}
      >
        {[...imgList, ...imgList].map((img, i) => (
          <img key={i} src={img} alt={`Campus ${i}`} />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   VIDEO HIGHLIGHT SECTION
══════════════════════════════════════════ */
function VideoHighlight() {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5
    }
  }, [])

  return (
    <section className="video-section">
      <div className="video-container smooth-fade">
        <video 
          ref={videoRef}
          className="looping-video"
          src={bgVideo} 
          autoPlay 
          loop 
          muted 
          playsInline 
        />
        <div className="video-overlay">
          <h2>Experience AI &amp; Data Science</h2>
          <div className="hero-divider" style={{ margin: '14px 0 20px 0', width: '50px' }} />
          <p>Innovating the future, one line of code at a time.</p>
          <p style={{ maxWidth: '750px', margin: '1rem auto 0', fontSize: '1.1rem', lineHeight: '1.8', opacity: 0.9 }}>
            Join a thriving ecosystem of brilliant minds. We push boundaries through extensive computational modeling, highly advanced algorithms, and a strictly hands-on approach to modern data engineering. Discover an education that transcends textbooks and immerses you in the raw forefront of global technology.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   ANIMATED STATS COUNTER
══════════════════════════════════════════ */
function useCounter(target, visible, duration = 2000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [visible, target, duration])
  return count
}

function useCarousel(itemCount, interval = 3000) {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const index = Math.round(el.scrollLeft / el.clientWidth)
      setActiveIndex(index)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const timer = setInterval(() => {
      let next = activeIndex + 1
      if (next >= itemCount) next = 0
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    }, interval)
    return () => clearInterval(timer)
  }, [activeIndex, itemCount, interval])

  const goTo = (idx) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: idx * scrollRef.current.clientWidth, behavior: 'smooth' })
    }
  }

  const prev = () => {
    let prevIdx = activeIndex - 1
    if (prevIdx < 0) prevIdx = itemCount - 1
    goTo(prevIdx)
  }

  const next = () => {
    let nextIdx = activeIndex + 1
    if (nextIdx >= itemCount) nextIdx = 0
    goTo(nextIdx)
  }

  return { scrollRef, activeIndex, goTo, prev, next }
}

const statsData = [
  { value: 200,  suffix: '+',  label: 'Students Enrolled',  icon: '🎓', color: '#0d9488' },
  { value: 10,   suffix: '+',  label: 'Expert Faculty',      icon: '👨‍🏫', color: '#f59e0b' },
  { value: 95,   suffix: '%',  label: 'Placement Rate',      icon: '💼', color: '#10b981' },
  { value: 5,   suffix: '+',  label: 'Research Papers',     icon: '📄', color: '#ef4444' },
  { value: 10,   suffix: '+',  label: 'Industry Partners',   icon: '🤝', color: '#8b5cf6' },
  { value: 3,    suffix: '',   label: 'Labs & Centers',      icon: '🔬', color: '#C9922A' },
]

function StatCard({ stat, visible }) {
  const count = useCounter(stat.value, visible)
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap" style={{ background: stat.color + '18', border: `2px solid ${stat.color}30` }}>
        <span className="stat-icon">{stat.icon}</span>
      </div>
      <h3 className="stat-number" style={{ color: stat.color }}>
        {count}{stat.suffix}
      </h3>
      <p className="stat-label">{stat.label}</p>
    </div>
  )
}

function StatsSection() {
  const [ref, visible] = useScrollReveal()
  return (
    <section className="stats-section" ref={ref}>
      <div className="stats-bg-anim" />
      <div className="container">
        <div className={`reveal-up ${visible ? 'revealed' : ''}`}>
          <div className="pill-badge" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>📊 BY THE NUMBERS</div>
          <h2 className="section-title" style={{ color: '#fff', marginBottom: '0.5rem' }}>Our Impact in Numbers</h2>
          <div className="section-divider" style={{ margin: '0 auto 1rem' }} />
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Decades of excellence reflected in our academic achievements and outcomes.
          </p>
        </div>
        <div className={`stats-grid reveal-up ${visible ? 'revealed' : ''}`} style={{ transitionDelay: '0.2s' }}>
          {statsData.map((s, i) => <StatCard key={i} stat={s} visible={visible} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   ABOUT US SECTION
══════════════════════════════════════════ */
function AboutSection() {
  const [ref, visible] = useScrollReveal()
  return (
    <section className="about-section" ref={ref}>
      <div className="container">
        <div className="about-grid">
          <div className={`about-content reveal-left ${visible ? 'revealed' : ''}`}>
            <h2 className="section-title">About <span className="text-blue">AI &amp; Data Science</span></h2>
            <div className="hero-divider" style={{ width: '50px', marginBottom: '1.5rem', background: '#0d9488' }} />
            <p className="about-text">
              The Department of Artificial Intelligence and Data Science at NPR College of Engineering &amp; Technology (NPRCET) is dedicated to pioneering world-class research and delivering unparalleled academic excellence. Established with the profound vision to create elite data scientists and AI engineers, we bridge the complex gap between theoretical computer science and practical, industry-driven innovation.
            </p>
            <p className="about-text">
              Our comprehensive curriculum is meticulously integrated with global industry demands, ensuring that every student is equipped with the advanced technical proficiencies necessary to thrive in the rapidly evolving technology landscape. From rigorous coursework in neural network architectures and natural language processing to deep statistical analytics, we mold individuals into leaders who can navigate the frontiers of the fourth industrial revolution.
            </p>
            <p className="about-text">
               We strongly believe that computing power alone is not enough; it is the human intellect driving these algorithms that will shape the future. By maintaining high-end laboratories, fostering deep academic-corporate partnerships, and employing a faculty composed of leading researchers, we provide an ecosystem where raw intellectual curiosity is forged into technical mastery and ethical intelligence.
            </p>
            
            <div className="about-features" style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <div style={{fontWeight: 700, color: 'var(--navy-deep)', display: 'flex', alignItems: 'center'}}>
                 <span style={{color: 'var(--gold)', marginRight: '10px', fontSize: '1.4rem'}}>✦</span> Industry-Aligned Syllabus
              </div>
              <div style={{fontWeight: 700, color: 'var(--navy-deep)', display: 'flex', alignItems: 'center'}}>
                 <span style={{color: 'var(--gold)', marginRight: '10px', fontSize: '1.4rem'}}>✦</span> 100% Placement Support
              </div>
              <div style={{fontWeight: 700, color: 'var(--navy-deep)', display: 'flex', alignItems: 'center'}}>
                 <span style={{color: 'var(--gold)', marginRight: '10px', fontSize: '1.4rem'}}>✦</span> Elite Research Labs
              </div>
              <div style={{fontWeight: 700, color: 'var(--navy-deep)', display: 'flex', alignItems: 'center'}}>
                 <span style={{color: 'var(--gold)', marginRight: '10px', fontSize: '1.4rem'}}>✦</span> Global Tech Interfacing
              </div>
            </div>
          </div>
          <div className={`about-image-wrapper reveal-right ${visible ? 'revealed' : ''}`}>
            <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80" alt="About AI & DS" className="about-image" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   VISION & MISSION SECTION
══════════════════════════════════════════ */
function VisionMissionSection() {
  const [ref, visible] = useScrollReveal()
  return (
    <section className="vm-section" ref={ref}>
      <div className="container">
        <div className="vm-grid">
          <div className={`vm-card reveal-left ${visible ? 'revealed' : ''}`}>
            <div className="vm-icon"></div>
            <h3 className="vm-title">Our Vision</h3>
            <p className="vm-text">To be a globally recognized center of excellence in the emerging domains of Artificial Intelligence and Data Science. We strive to foster aggressive innovation, rigorous research, and to produce highly competent, ethically grounded professionals who are fully capable of solving the world's most complex and pressing societal challenges through automation, analytics, and intelligent systems.</p>
            <p className="vm-text" style={{marginTop: '1.5rem'}}>Through continuous adaptation to technological advancements, we aim to be the cradle from which the next generation of global tech leaders and paradigm-shifting entrepreneurs will launch their careers, ultimately advancing the profound technological footprint of our nation on the global stage.</p>
          </div>
          <div className={`vm-card reveal-right ${visible ? 'revealed' : ''}`} style={{ transitionDelay: '0.2s' }}>
            <div className="vm-icon"></div>
            <h3 className="vm-title">Our Mission</h3>
            <ul className="vm-list">
              <li><strong style={{color:'var(--navy-deep)'}}>Academic Rigor:</strong> To provide state-of-the-art computational infrastructure and a transformative learning environment that continuously adapts to the aggressive leaps in machine learning and data engineering.</li>
              <li style={{marginTop: '1rem'}}><strong style={{color:'var(--navy-deep)'}}>Corporate Synergy:</strong> To heavily foster industry-academia collaboration for practical skill development, securing robust internships, and ensuring immediate corporate deployability upon graduation.</li>
              <li style={{marginTop: '1rem'}}><strong style={{color:'var(--navy-deep)'}}>Ethical Framework:</strong> To cultivate an enduring ecosystem of research, academic integrity, and lifelong learning among students, ensuring that the AI deployment of tomorrow remains safe, unbiased, and profoundly beneficial to all humanity.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   FACULTY SECTION
══════════════════════════════════════════ */
const facultyData = [
  { name: "Dr. A. Sharma", role: "Professor & Head of Department", specialty: "Machine Learning & AI", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80" },
  { name: "Dr. P. Verma", role: "Associate Professor", specialty: "Data Analytics", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
  { name: "Prof. K. Iyer", role: "Assistant Professor", specialty: "Neural Networks", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
  { name: "Dr. N. Menon", role: "Assistant Professor", specialty: "Cloud Computing & Big Data", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80" },
  { name: "Dr. S. Reddy", role: "Professor", specialty: "Robotics & Automation", img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80" },
  { name: "Prof. L. Krishnan", role: "Associate Professor", specialty: "Natural Language Processing", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80" },
  { name: "Dr. R. Desai", role: "Assistant Professor", specialty: "Computer Vision", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { name: "Dr. M. Joseph", role: "Senior Lecturer", specialty: "Cybersecurity & Cryptography", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" }
]

function FacultySection() {
  const [ref, visible] = useScrollReveal()
  return (
    <section className="faculty-section" ref={ref}>
      <div className="container">
        <div className={`reveal-up ${visible ? 'revealed' : ''}`}>
          <h2 className="section-title">Our Expert Faculty</h2>
          <div className="section-divider" />
          <p className="section-subtitle">Learn from industry veterans and academic pioneers leading the AI revolution.</p>
        </div>
        <div className="faculty-grid">
          {facultyData.map((faculty, idx) => (
            <div key={idx} className={`faculty-card reveal-up ${visible ? 'revealed' : ''}`} style={{ transitionDelay: `${idx * 0.07}s` }}>
              <div className="faculty-img-wrapper">
                <img src={faculty.img} alt={faculty.name} className="faculty-img" />
              </div>
              <div className="faculty-info">
                <h3 className="faculty-name">{faculty.name}</h3>
                <p className="faculty-role">{faculty.role}</p>
                <div className="faculty-specialty">{faculty.specialty}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   RESEARCH & LABS SECTION
══════════════════════════════════════════ */
const labsData = [
  { title: "Cognitive Computing Lab", desc: "Equipped with high-performance NVIDIA Tesla server clusters and multi-GPU arrays. This lab acts as the core heartbeat for our deep learning, big data analysis, and highly intensive neural network training research initiatives led by our top faculty.", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80" },
  { title: "IoT & Automation Sandbox", desc: "A state-of-the-art hardware facility dedicated to bridging software intelligence with physical embedded systems. Students build massive, interconnected hardware frameworks for automated drones, smart-city management, and robust industrial robotics logistics.", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80" },
  { title: "Data Analytics & Infosec Center", desc: "Designed to handle massive data pipelines securely. We foster dedicated partnerships with primary cloud providers and industry leaders here to train students comprehensively on solving real-world, enterprise-level big data and cybersecurity challenges.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" }
]

function ResearchSection() {
  const [ref, visible] = useScrollReveal()
  return (
    <section className="research-section" ref={ref}>
      <div className="container">
        <div className={`reveal-up ${visible ? 'revealed' : ''}`}>
          <h2 className="section-title">Cutting-Edge Hubs</h2>
          <div className="section-divider" />
          <p className="section-subtitle">Where theory meets application. Explore our advanced research facilities.</p>
        </div>
        <div className={`research-grid reveal-up ${visible ? 'revealed' : ''}`} style={{ transitionDelay: '0.2s' }}>
          {labsData.map((lab, idx) => (
            <div key={idx} className="lab-card">
              <img src={lab.img} alt={lab.title} className="lab-bg" />
              <div className="lab-overlay">
                <h3 className="lab-title">{lab.title}</h3>
                <p className="lab-desc">{lab.desc}</p>
                <a href="#" className="lab-link">Explore Lab &rarr;</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   ACHIEVEMENTS & ACCREDITATIONS SECTION
══════════════════════════════════════════ */
const achievementsData = [
  { icon: '🏆', title: 'NAAC A+ Accredited', desc: 'Awarded the highest NAAC grade for outstanding academic quality, infrastructure, and student outcomes.', color: '#f59e0b' },
  { icon: '🎖', title: 'NBA Accredited Programs', desc: 'All engineering programs are NBA accredited, validating our commitment to global quality standards.', color: '#6366f1' },
  // { icon: '🌐', title: 'NIRF Top 200', desc: 'Ranked among India\'s top 200 engineering institutions by the National Institutional Ranking Framework.', color: '#0ea5e9' },
  // { icon: '📜', title: '25+ Patents Filed', desc: 'Faculty and students have jointly filed over 25 patents in AI, IoT, and smart systems domains.', color: '#10b981' },
  // { icon: '💡', title: 'DST Funded Research', desc: 'Recipient of multiple Department of Science & Technology grants for frontier AI research projects.', color: '#ef4444' },
  { icon: '🌟', title: ' Hackathon Winners', desc: 'Our teams have consistently won top prizes at SIH and inter-university innovation competitions.', color: '#8b5cf6' },
]

function AchievementsSection() {
  const [ref, visible] = useScrollReveal()
  return (
    <section className="achievements-section" ref={ref}>
      <div className="container">
        <div className={`text-center reveal-up ${visible ? 'revealed' : ''}`}>
          <div className="pill-badge" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>🏅 ACHIEVEMENTS</div>
          <h2 className="section-title" style={{ color: '#fff' }}>Milestones & <span style={{ color: '#f59e0b' }}>Recognition</span></h2>
          <div className="section-divider" style={{ margin: '0 auto 1rem' }} />
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Our consistent pursuit of excellence has earned us national and international recognition.
          </p>
        </div>
        <div className={`achievements-grid reveal-up ${visible ? 'revealed' : ''}`} style={{ transitionDelay: '0.2s' }}>
          {achievementsData.map((item, idx) => (
            <div key={idx} className="achievement-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="achieve-icon-ring" style={{ borderColor: item.color + '50', background: item.color + '15' }}>
                <span style={{ fontSize: '2.2rem' }}>{item.icon}</span>
              </div>
              <h4 className="achieve-title" style={{ color: item.color }}>{item.title}</h4>
              <p className="achieve-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   EVENTS & ACTIVITIES SECTION
══════════════════════════════════════════ */
const eventsData = [
  {
    date: 'MAR 15, 2026',
    tag: 'Hackathon',
    title: 'AI Innovathon 2026',
    desc: 'A 36-hour national-level hackathon challenging students to build real-world AI solutions for healthcare, agriculture, and smart cities.',
    img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
    tagColor: '#6366f1'
  },
  {
    date: 'APR 02, 2026',
    tag: 'Workshop',
    title: 'Deep Learning Bootcamp',
    desc: 'An intensive 3-day bootcamp on PyTorch, TensorFlow, and modern transformer architectures conducted by Google engineers.',
    img: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80',
    tagColor: '#10b981'
  },
  {
    date: 'APR 20, 2026',
    tag: 'Symposium',
    title: 'DataQuest National Symposium',
    desc: 'NPRCET\'s annual technical symposium featuring paper presentations, project expos, and keynote addresses from industry leaders.',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
    tagColor: '#f59e0b'
  },
  {
    date: 'MAY 10, 2026',
    tag: 'Guest Lecture',
    title: 'Future of GenAI in Industry',
    desc: 'A distinguished lecture series by Dr. Andrew Ng\'s team covering the transformative impact of generative AI in enterprise environments.',
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
    tagColor: '#0ea5e9'
  },
  {
    date: 'JUN 05, 2026',
    tag: 'Cultural',
    title: 'TechFest & Cultural Night',
    desc: 'An evening of innovation and celebration blending technical showcases with cultural performances by the student community.',
    img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    tagColor: '#ef4444'
  },
  {
    date: 'JUN 20, 2026',
    tag: 'Internship Fair',
    title: 'Summer Internship Expo 2026',
    desc: 'Top tech companies descend on campus to offer summer internships, live project opportunities, and pre-placement offers.',
    img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80',
    tagColor: '#8b5cf6'
  },
]

function EventsSection() {
  const [ref, visible] = useScrollReveal()
  const { scrollRef, activeIndex, goTo, prev, next } = useCarousel(eventsData.length, 3500)
  return (
    <section className="events-section" ref={ref}>
      <div className="container">
        <div className={`text-center reveal-up ${visible ? 'revealed' : ''}`}>
          <div className="pill-badge">📅 EVENTS & ACTIVITIES</div>
          <h2 className="section-title">Campus Life & <span className="text-blue">Events</span></h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            Stay connected with the pulse of our department through hackathons, workshops, cultural fests, and more.
          </p>
        </div>
        <div className="carousel-wrapper">
          <button className="carousel-arrow left" onClick={prev}>&lsaquo;</button>
          <div className={`events-grid reveal-up ${visible ? 'revealed' : ''}`} style={{ transitionDelay: '0.2s' }} ref={scrollRef}>
            {eventsData.map((ev, idx) => (
              <div key={idx} className="event-card">
                <div className="event-img-wrap">
                  <img src={ev.img} alt={ev.title} className="event-img" />
                  <span className="event-tag" style={{ background: ev.tagColor }}>{ev.tag}</span>
                </div>
                <div className="event-body">
                  <span className="event-date">{ev.date}</span>
                  <h3 className="event-title">{ev.title}</h3>
                  <p className="event-desc">{ev.desc}</p>
                  <a href="#" className="event-link" style={{ color: ev.tagColor }}>Learn More →</a>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-arrow right" onClick={next}>&rsaquo;</button>
        </div>
        <div className="carousel-dots">
          {eventsData.map((_, idx) => (
            <button key={idx} className={`dot ${activeIndex === idx ? 'active' : ''}`} onClick={() => goTo(idx)} aria-label={`Go to slide ${idx + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}


/* ══════════════════════════════════════════
   ALUMNI FEEDBACK SECTION
══════════════════════════════════════════ */
const alumniData = [
  { name: "Vikram S.", company: "Google DeepMind", feedback: "The AI&DS department provided me with a world-class foundation in neural networks. The faculty and labs are unmatched in the country.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
  { name: "Anita R.", company: "Microsoft Research", feedback: "NPRCET's emphasis on practical innovation and research allowed me to publish my first paper before I even graduated.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { name: "Rohan D.", company: "Amazon Web Services", feedback: "The rigorous curriculum and industry tie-ups completely transformed my career trajectory. I got my dream job right out of campus.", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80" }
]

function AlumniSection() {
  const [ref, visible] = useScrollReveal()
  const { scrollRef, activeIndex, goTo, prev, next } = useCarousel(alumniData.length, 4000)
  return (
    <section className="alumni-section" ref={ref}>
      <div className="container">
        <div className={`reveal-up ${visible ? 'revealed' : ''}`}>
          <h2 className="section-title">Alumni Feedback</h2>
          <div className="section-divider" />
          <p className="section-subtitle">Hear from our exceptional graduates who are shaping the global technology landscape.</p>
        </div>
        <div className="carousel-wrapper">
          <button className="carousel-arrow left light-arrow" onClick={prev}>&lsaquo;</button>
          <div className={`alumni-grid reveal-up ${visible ? 'revealed' : ''}`} style={{ transitionDelay: '0.2s' }} ref={scrollRef}>
            {alumniData.map((alumni, idx) => (
              <div key={idx} className="testimonial-card">
                <div className="quote-icon">"</div>
                <p className="testimonial-text">{alumni.feedback}</p>
                <div className="alumni-client">
                  <img src={alumni.img} alt={alumni.name} className="alumni-avatar" />
                  <div className="alumni-client-info">
                    <h4 className="alumni-name">{alumni.name}</h4>
                    <p className="alumni-company">{alumni.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-arrow right light-arrow" onClick={next}>&rsaquo;</button>
        </div>
        <div className="carousel-dots light-dots">
          {alumniData.map((_, idx) => (
            <button key={idx} className={`dot ${activeIndex === idx ? 'active' : ''}`} onClick={() => goTo(idx)} aria-label={`Go to testimonial ${idx + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   PLACEMENTS SECTION
══════════════════════════════════════════ */
function PlacementsSection() {
  const [ref, visible] = useScrollReveal()
  return (
    <section className="placements-section" ref={ref}>
      <div className="container" style={{ textAlign: 'center' }}>
        <div className={`reveal-up ${visible ? 'revealed' : ''}`}>
          <div className="pill-badge">💼 PLACEMENTS</div>
          <h2 className="section-title">Careers That <span className="text-blue">Define the Future</span></h2>
          <p className="section-subtitle">Our graduates are building careers at the world's most innovative companies</p>
        </div>
        <div className={`placements-grid reveal-up ${visible ? 'revealed' : ''}`} style={{ transitionDelay: '0.2s' }}>
          <div className="placement-card">
            <h3 className="placement-value">₹9 LPA</h3>
            <p className="placement-label">Highest Package</p>
            <div className="placement-icon">↑</div>
          </div>
          <div className="placement-card">
            <h3 className="placement-value">₹3 LPA</h3>
            <p className="placement-label">Average Package</p>
            <div className="placement-icon">📈</div>
          </div>
          <div className="placement-card">
            <h3 className="placement-value">95%</h3>
            <p className="placement-label">Placement Rate</p>
            <div className="placement-icon">👥</div>
          </div>
          <div className="placement-card">
            <h3 className="placement-value">10+</h3>
            <p className="placement-label">Recruiting Companies</p>
            <div className="placement-icon">🏢</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   RECRUITERS SECTION
══════════════════════════════════════════ */
const recruiters = ["Google", "Amazon", "Microsoft", "TCS", "Infosys", "IBM", "Wipro", "Cognizant", "Accenture", "Capgemini"];

function RecruitersSection() {
  return (
    <section className="recruiters-section">
      <div className="container" style={{ textAlign: 'center', overflow: 'hidden' }}>
        <h4 className="recruiter-heading">OUR GRADUATES ARE CONTINUOUSLY HIRED BY GLOBAL LEADERS</h4>
        <div className="marquee-wrapper">
          <div className="marquee">
            {recruiters.map((brand, idx) => (
              <div key={`a-${idx}`} className="brand-logo">{brand}</div>
            ))}
            {recruiters.map((brand, idx) => (
              <div key={`b-${idx}`} className="brand-logo" aria-hidden="true">{brand}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   CONTACT SECTION
══════════════════════════════════════════ */
function ContactSection() {
  const [ref, visible] = useScrollReveal()
  return (
    <section className="contact-section" ref={ref}>
      <div className="container">
        <div className={`text-center reveal-up ${visible ? 'revealed' : ''}`} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="pill-badge">✉️ GET IN TOUCH</div>
          <h2 className="section-title">Contact <span className="text-blue">Us</span></h2>
          <p className="section-subtitle">We'd love to hear from you. Reach out for admissions, research collaborations, or general queries.</p>
        </div>

        <div className="contact-grid">
          {/* Left Col */}
          <div className={`contact-info reveal-left ${visible ? 'revealed' : ''}`}>
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-text">
                <h4>Address</h4>
                <p>Department of AI &amp; Data Science,<br/>Block C, 3rd Floor,<br/>NPR College of Engineering &amp; Technology,<br/>Natham, Dindigul - 624 401</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-text">
                <h4>Phone</h4>
                <p>+91 44 2222 3333 (Dept. Office)<br/>+91 98765 43210 (HOD Direct)</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">✉️</div>
              <div className="info-text">
                <h4>Email</h4>
                <p>aids@nprcet.edu.in<br/>hod.aids@nprcet.edu.in</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">🕒</div>
              <div className="info-text">
                <h4>Office Hours</h4>
                <p>Monday – Friday: 9:00 AM – 5:00 PM<br/>Saturday: 9:00 AM – 1:00 PM</p>
              </div>
            </div>
          </div>
          
          {/* Right Col */}
          <div className={`contact-form reveal-right ${visible ? 'revealed' : ''}`}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" placeholder="Your first name" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" placeholder="Your last name" />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <select>
                <option>Select a subject</option>
                <option>Admissions</option>
                <option>Research Collaboration</option>
                <option>General Query</option>
              </select>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea placeholder="Write your message here..." rows={4}></textarea>
            </div>
            <button className="submit-btn" type="submit">Send Message</button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   FOOTER SECTION
══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <img src={adLogo} alt="NPR Logo" className="footer-logo" />
            <p>Empowering the next generation of engineers, scientists, and leaders to shape the future of artificial intelligence and data science.</p>
            <div className="social-links">
              <a href="#">Fb</a>    
              <a href="#">Tw</a>
              <a href="#">In</a>
              <a href="#">Yt</a>
            </div>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#">About NPRCET</a></li>
              <li><a href="#">Admissions 2026</a></li>
              <li><a href="#">Academic Programs</a></li>
              <li><a href="#">Campus Life</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Resources</h3>
            <ul className="footer-links">
              <li><a href="#">Library</a></li>
              <li><a href="#">Research Labs</a></li>
              <li><a href="#">Student Portal</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Contact Us</h3>
            <ul className="footer-links">
              <li>NPR Nagar, Natham</li>
              <li>Dindigul - 624 401</li>
              <li>Tamilnadu, India</li>
              <li>Phone: +91 4544 246 500</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NPR College of Engineering &amp; Technology. Department of AI&DS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

/* ══════════════════════════════════════════
   APP
══════════════════════════════════════════ */
function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useEffect(() => {
    const header = document.querySelector('.main-header')
    const onScroll = () => {
      if (window.scrollY > 40) header.classList.add('scrolled')
      else header.classList.remove('scrolled')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="app-wrapper">
      {/* ── Transparent Glass Header ── */}
      <header className="main-header">
        <div className="logo-section">
          <img src={adLogo} alt="NPR Shield Logo" style={{ height: '56px', width: 'auto' }} />
          <div className="logo-text">
            AI&DS
            <span>NPRCET</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#">About</a>
          <a href="#">Admissions</a>
          <a href="#">Academics</a>
          <a href="#">Research</a>
          <a href="#">Campus</a>
          <a href="#">Placements</a>
          <a href="#">Alumni</a>
          <a href="#" className="nav-cta">Apply Now</a>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main className="hero-section">
        <Marquee imgList={topImages} direction="normal"  speed="38s" />
        <NeuralParallax />
        <Marquee imgList={bottomImages} direction="reverse" speed="38s" />
      </main>

      {/* ── Looping Video ── */}
      <VideoHighlight />

      {/* ── Stats Counter ── */}
      <StatsSection />

      {/* ── About Us ── */}
      <AboutSection />


      {/* ── Vision & Mission ── */}
      <VisionMissionSection />

      {/* ── Faculty ── */}
      <FacultySection />

      {/* ── Research Labs ── */}
      <ResearchSection />

      {/* ── Achievements ── */}
      <AchievementsSection />

      {/* ── Events ── */}
      <EventsSection />


      {/* ── Alumni Feedback ── */}
      <AlumniSection />

      {/* ── Placements ── */}
      <PlacementsSection />

      {/* ── Top Recruiters ── */}
      <RecruitersSection />

      {/* ── Contact Us ── */}
      <ContactSection />

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}

export default App
