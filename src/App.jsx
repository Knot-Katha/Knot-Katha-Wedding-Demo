import {
  CalendarDays, Camera, ChevronLeft, ChevronRight, Clock3, Heart,
  MapPin, Menu, MessageCircle,
  Play, Send, Sparkles, X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import bride from './assets/bride.jpg'
import couple from './assets/couple.jpg'
import groom from './assets/groom.jpg'
import hero from './assets/hero-palace.png'
import weddingSong from './assets/wedding-ambient.wav'

const WEDDING = {
  groom: 'Groom',
  bride: 'His Partner',
  dateLabel: '28 · FEB · 2027',
  city: 'MEERUT, UTTAR PRADESH',
  countdownTarget: '2027-02-28T11:00:00+05:30',
  venue: 'Knot & Katha Celebration',
  mapUrl: 'https://maps.google.com',
  whatsapp: '916396486200',
  story: 'From a chance meeting to a lifetime of togetherness, our story has been filled with beautiful moments, endless laughter, and unwavering support. Now, we are excited to begin this new chapter and would love for you to be a part of it.',
  events: [
    {
      title: 'Mehendi',
      date: '26 Feb 2027',
      time: '4:00 PM onwards',
      place: 'Home Celebration',
      image: bride,
      description: 'An intimate evening of mehendi, laughter, music and family traditions.',
      start: '20270226T160000',
      end: '20270226T200000'
    },
    {
      title: 'Sangeet',
      date: '27 Feb 2027',
      time: '7:00 PM onwards',
      place: 'Celebration Hall',
      image: couple,
      description: 'A night of music, dance and unforgettable performances with our favourite people.',
      start: '20270227T190000',
      end: '20270227T230000'
    },
    {
      title: 'Wedding',
      date: '28 Feb 2027',
      time: '11:00 AM onwards',
      place: 'Main Ceremony',
      image: couple,
      description: 'The main ceremony where two families come together for a beautiful new beginning.',
      start: '20270228T110000',
      end: '20270228T150000'
    },
    {
      title: 'Reception',
      date: '01 Mar 2027',
      time: '7:00 PM onwards',
      place: 'Grand Reception',
      image: groom,
      description: 'An evening of dinner, celebration and memories as we begin this new chapter.',
      start: '20270301T190000',
      end: '20270301T230000'
    }
  ]
}

function useCountdown(target) {
  const calc = () => {
    const diff = Math.max(0, new Date(target).getTime() - Date.now())
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor(diff / 3600000) % 24,
      minutes: Math.floor(diff / 60000) % 60,
      seconds: Math.floor(diff / 1000) % 60
    }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [target])
  return time
}

function App() {
  const [menu, setMenu] = useState(false)
  const [music, setMusic] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  const [rsvpSent, setRsvpSent] = useState(false)
  const audioRef = useRef(null)
  const countdown = useCountdown(WEDDING.countdownTarget)
  const gallery = [couple, bride, groom, couple, bride, hero]

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    els.forEach((el, index) => {
      el.style.setProperty('--delay', `${Math.min(index * 45, 360)}ms`)
      io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenu(false)
  }

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (audio.paused) {
        await audio.play()
        setMusic(true)
      } else {
        audio.pause()
        setMusic(false)
      }
    } catch {
      setMusic(false)
    }
  }

  const addToCalendar = (event) => {
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Knot & Katha//Wedding//EN',
      'BEGIN:VEVENT',
      `UID:${event.title.toLowerCase()}-knot-katha@example.com`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=Asia/Kolkata:${event.start}`,
      `DTEND;TZID=Asia/Kolkata:${event.end}`,
      `SUMMARY:${event.title} — ${WEDDING.groom} & ${WEDDING.bride}`,
      `LOCATION:${event.place}`,
      'DESCRIPTION:Wedding celebration by Knot & Katha.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.toLowerCase()}-wedding.ics`
    link.click()
    URL.revokeObjectURL(url)
  }

  const sendRsvp = (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const text = [
      'Wedding RSVP',
      '',
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Attendance: ${data.get('attendance')}`,
      `Message: ${data.get('message') || ''}`
    ].join('\n')
    window.open(`https://wa.me/${WEDDING.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    setRsvpSent(true)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true
    audio.volume = 0.2

    const tryPlay = () => {
      audio.play().then(() => setMusic(true)).catch(() => setMusic(false))
    }

    // Attempt autoplay immediately. Modern browsers may block audible autoplay.
    tryPlay()

    // Fallback: the first user interaction starts the song automatically.
    const fallback = () => {
      if (audio.paused) audio.play().then(() => setMusic(true)).catch(() => {})
      window.removeEventListener('pointerdown', fallback)
      window.removeEventListener('keydown', fallback)
      window.removeEventListener('touchstart', fallback)
    }
    window.addEventListener('pointerdown', fallback, { once: true })
    window.addEventListener('keydown', fallback, { once: true })
    window.addEventListener('touchstart', fallback, { once: true })

    return () => {
      window.removeEventListener('pointerdown', fallback)
      window.removeEventListener('keydown', fallback)
      window.removeEventListener('touchstart', fallback)
    }
  }, [])

  return (
    <div className="site">
      <audio ref={audioRef} src={weddingSong} preload="auto" />
      <div className="paper-grain" />

      <header className="nav">
        <button className="brand" onClick={() => scrollTo('#home')}>
          <span className="brand-flower">❧</span>
          <span>
            <strong>Knot & Katha</strong>
            <small>Stories worth inviting people to.</small>
          </span>
        </button>

        <button className="menu" onClick={() => setMenu(!menu)} aria-label="Menu">
          {menu ? <X /> : <Menu />}
        </button>

        <nav className={menu ? 'nav-links open' : 'nav-links'}>
          {[
            ['Home', '#home'],
            ['Our Story', '#story'],
            ['Events', '#events'],
            ['Gallery', '#gallery'],
            ['Venue', '#venue'],
            ['RSVP', '#rsvp']
          ].map(([label, href]) => (
            <button key={label} onClick={() => scrollTo(href)}>{label}</button>
          ))}
          <button className="save" onClick={() => scrollTo('#rsvp')}>
            <CalendarDays size={15} /> Save the Date
          </button>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-bg" />
          <div className="hero-dark" />
          <div className="hero-flower flower-a">✿</div>
          <div className="hero-flower flower-b">❀</div>
          <div className="hero-copy reveal">
            <span className="eyebrow light">TOGETHER FOREVER</span>
            <h1>{WEDDING.groom}<em>&</em>{WEDDING.bride}</h1>
            <p className="script">are getting married</p>
            <div className="date">{WEDDING.dateLabel}</div>
            <div className="city">{WEDDING.city}</div>
            <button className="hero-btn" onClick={() => scrollTo('#story')}>You're Invited <ChevronRight size={17} /></button>
          </div>

          <div className="hero-side reveal">
            <div>Two Hearts</div>
            <div>One Journey.</div>
            <div>A Lifetime</div>
            <div>Together.</div>
            <Heart size={15} fill="currentColor" />
          </div>

          <button className={`music ${music ? 'active' : ''}`} onClick={toggleMusic}>
            <span className="play"><Play size={15} fill="currentColor" /></span>
            {music ? 'Music On' : 'Play Our Song'}
            <span className="eq"><i /><i /><i /><i /></span>
          </button>

          <div className="hero-index"><b>01</b><span /><small>05</small></div>
        </section>

        <section className="countdown paper">
          <div className="sketch sketch-left">❀</div>
          <div className="sketch sketch-right">❀</div>
          <div className="heading reveal">
            <span className="eyebrow">COUNTDOWN</span>
            <h2>The Big Day Is Coming</h2>
            <div className="heartline"><span /><Heart size={12} fill="currentColor" /><span /></div>
          </div>
          <div className="count-grid">
            {Object.entries(countdown).map(([key, value]) => (
              <div className="count reveal" key={key}>
                <strong>{String(value).padStart(2, '0')}</strong>
                <span>{key}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="story" className="story">
          <div className="story-bg" />
          <div className="story-photos reveal">
            <div className="polaroid p-one"><img src={groom} alt="Groom" /><span>It all started with a smile...</span></div>
            <div className="polaroid p-two"><img src={bride} alt="Bride" /><span>and became forever.</span></div>
          </div>
          <div className="story-copy reveal">
            <span className="eyebrow light">OUR STORY</span>
            <h2>A Journey of <br /><i>Two Hearts</i></h2>
            <p>{WEDDING.story}</p>
            <button className="outline light-outline" onClick={() => scrollTo('#events')}>Read Our Story <ChevronRight size={15} /></button>
          </div>
          <div className="story-sketch">♜</div>
        </section>

        <section id="events" className="events paper">
          <div className="heading reveal">
            <span className="eyebrow">WEDDING EVENTS</span>
            <h2>Join Us In Our Celebration</h2>
            <div className="heartline"><span /><Heart size={12} fill="currentColor" /><span /></div>
          </div>
          <div className="event-grid">
            {WEDDING.events.map((event, i) => (
              <article className="event-card reveal" key={event.title}>
                <div className="event-photo">
                  <img src={event.image} alt={event.title} />
                  <small>0{i + 1}</small>
                </div>
                <div className="event-body">
                  <div className="event-icon"><Sparkles size={16} /></div>
                  <h3>{event.title}</h3>
                  <p><CalendarDays size={13} />{event.date}</p>
                  <p><Clock3 size={13} />{event.time}</p>
                  <p><MapPin size={13} />{event.place}</p>
                  <button onClick={() => setSelectedEvent(event)}>View Details <ChevronRight size={13} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="gallery" className="gallery">
          <div className="gallery-backdrop" />
          <div className="heading light-heading reveal">
            <span className="eyebrow light">GALLERY</span>
            <h2>Moments to Cherish</h2>
            <div className="heartline lightline"><span /><Heart size={12} fill="currentColor" /><span /></div>
          </div>
          <div className="gallery-wrap reveal">
            <button className="circle-arrow" onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}><ChevronLeft /></button>
            <button className="gallery-main" onClick={() => setLightbox(gallery[galleryIndex])}>
              <img src={gallery[galleryIndex]} alt="Wedding moment" />
              <span>Click to view</span>
            </button>
            <button className="circle-arrow" onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}><ChevronRight /></button>
          </div>
          <div className="thumbs">
            {gallery.map((img, i) => (
              <button className={i === galleryIndex ? 'thumb active' : 'thumb'} key={i} onClick={() => setGalleryIndex(i)}>
                <img src={img} alt={`Moment ${i + 1}`} />
              </button>
            ))}
          </div>
        </section>

        <section id="venue" className="venue paper">
          <div className="venue-copy reveal">
            <span className="eyebrow">VENUE</span>
            <h2>Let's Celebrate <br /><i>Together</i></h2>
            <div className="venue-title"><MapPin size={27} /><span><strong>{WEDDING.venue}</strong><small>{WEDDING.city}</small></span></div>
            <p>A beautiful setting for our special day. We can't wait to celebrate with you.</p>
            <a className="hero-btn dark-btn" href={WEDDING.mapUrl} target="_blank" rel="noreferrer">View on Google Maps <ChevronRight size={16} /></a>
          </div>

          <div className="map reveal">
            <div className="map-surface">
              <div className="road r1" /><div className="road r2" /><div className="road r3" />
              <div className="map-pin"><MapPin fill="currentColor" /></div>
              <div className="map-tag">{WEDDING.venue}</div>
            </div>
            <img src={hero} alt="Venue ambience" />
          </div>

          <div className="rsvp reveal" id="rsvp">
            <span className="eyebrow">RSVP</span>
            <h2>We'd Love <br /><i>to Have You</i></h2>
            <div className="heartline"><span /><Heart size={12} fill="currentColor" /><span /></div>
            {rsvpSent ? (
              <div className="success"><Heart size={30} fill="currentColor" /><strong>Thank you!</strong><span>Your RSVP has been sent to WhatsApp.</span></div>
            ) : (
              <form onSubmit={sendRsvp}>
                <div className="form-row">
                  <input name="name" required placeholder="Your Name" />
                  <input name="email" type="email" placeholder="Email Address" />
                </div>
                <select name="attendance" defaultValue="" required>
                  <option value="" disabled>Will you attend?</option>
                  <option>Yes, with pleasure</option>
                  <option>Sorry, can't make it</option>
                </select>
                <textarea name="message" rows="3" placeholder="Message (Optional)" />
                <button className="hero-btn dark-btn" type="submit"><Send size={15} /> Send RSVP <ChevronRight size={15} /></button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-flower">❧</span>
          <span><strong>Knot & Katha</strong><small>Stories worth inviting people to.</small></span>
        </div>
        <div className="footer-center">
          <p>Beautiful Invitations. Unforgettable Stories.</p>
          <div>
            <button onClick={() => scrollTo('#home')} aria-label="Gallery"><Camera size={16} /></button>
            <a href={`https://wa.me/${WEDDING.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={16} /></a>
          </div>
        </div>
        <a className="footer-cta" href={`https://wa.me/${WEDDING.whatsapp}`} target="_blank" rel="noreferrer">
          <MessageCircle size={16} /> Create Your Wedding Website <ChevronRight size={15} />
        </a>
      </footer>

      {selectedEvent && (
        <div className="modal" onClick={() => setSelectedEvent(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}><X /></button>
            <div className="modal-image"><img src={selectedEvent.image} alt={selectedEvent.title} /></div>
            <div className="modal-content">
              <span className="eyebrow">WEDDING CELEBRATION</span>
              <h2>{selectedEvent.title}</h2>
              <p>{selectedEvent.description}</p>
              <div className="modal-meta">
                <span><CalendarDays size={15}/>{selectedEvent.date}</span>
                <span><Clock3 size={15}/>{selectedEvent.time}</span>
                <span><MapPin size={15}/>{selectedEvent.place}</span>
              </div>
              <div className="modal-actions">
                <button className="hero-btn dark-btn" onClick={() => addToCalendar(selectedEvent)}><CalendarDays size={15}/> Add to Calendar</button>
                <a className="outline" href={WEDDING.mapUrl} target="_blank" rel="noreferrer"><MapPin size={15}/> View Location</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="close-lightbox" onClick={() => setLightbox(null)}><X /></button>
          <img src={lightbox} alt="Wedding moment enlarged" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default App
