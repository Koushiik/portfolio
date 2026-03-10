import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { PORTFOLIO_CONTENT_DEFAULTS, type PortfolioContent } from './contentConfig'

const ADMIN_PREVIEW_STORAGE_KEY_PREFIX = 'portfolioAdminPreviewContent:'
const NAV_SECTIONS = [
  'about',
  'skills',
  'experience',
  'projects',
  'blog',
  'education',
  'contact',
] as const

const BLOG_IMAGES: Record<string, string> = {
  '1': '/assets/blog-cover-ops.svg',
  '2': '/assets/blog-cover-delivery.svg',
  '3': '/assets/blog-cover-warehouse.svg',
}

const splitLines = (value: string | undefined) =>
  String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const sanitizeRichHtml = (html: string) => {
  const template = document.createElement('template')
  template.innerHTML = String(html || '')
  template.content.querySelectorAll('script,style,iframe,object,embed').forEach((node) => node.remove())
  template.content.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      if (/^on/i.test(attr.name)) {
        node.removeAttribute(attr.name)
      }
    })
    if (node instanceof HTMLAnchorElement) {
      const href = node.getAttribute('href') || ''
      if (href.trim().toLowerCase().startsWith('javascript:')) {
        node.removeAttribute('href')
      }
    }
  })
  return template.innerHTML.trim()
}

function App() {
  const [content, setContent] = useState<PortfolioContent>(PORTFOLIO_CONTENT_DEFAULTS)
  const [activeSection, setActiveSection] = useState<(typeof NAV_SECTIONS)[number]>('about')
  const [localTime, setLocalTime] = useState('')
  const [blogModalIndex, setBlogModalIndex] = useState<string | null>(null)

  useEffect(() => {
    const applyContent = (payload: Partial<PortfolioContent> | null | undefined) => {
      setContent({ ...PORTFOLIO_CONTENT_DEFAULTS, ...(payload || {}) })
    }

    const loadContent = async () => {
      const params = new URLSearchParams(window.location.search)
      const isAdminPreview = params.get('adminPreview') === '1'
      const previewId = String(params.get('previewId') || '').trim()

      if (isAdminPreview) {
        try {
          const rawPreview = previewId
            ? window.localStorage.getItem(`${ADMIN_PREVIEW_STORAGE_KEY_PREFIX}${previewId}`)
            : null
          if (rawPreview) {
            const previewContent = JSON.parse(rawPreview) as Partial<PortfolioContent>
            applyContent(previewContent)
            return
          }
        } catch {
          // Fall back to content.json when preview payload is unavailable.
        }
      }

      try {
        const response = await fetch('/data/content.json', {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        if (!response.ok) throw new Error('Failed to load content')
        const payload = (await response.json()) as Partial<PortfolioContent>
        applyContent(payload)
      } catch {
        applyContent(PORTFOLIO_CONTENT_DEFAULTS)
      }
    }

    loadContent()
  }, [])

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const updateTime = () => {
      const now = new Date()
      setLocalTime(`Local time ${formatter.format(now)}`)
    }

    updateTime()
    const id = window.setInterval(updateTime, 30000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const updateActiveLink = () => {
      const offsetFromTop = window.matchMedia('(min-width: 1024px)').matches ? 180 : 120
      const probeY = window.scrollY + offsetFromTop

      let currentId = NAV_SECTIONS[0]
      NAV_SECTIONS.forEach((id) => {
        const section = document.getElementById(id)
        if (section && section.offsetTop <= probeY) {
          currentId = id
        }
      })

      setActiveSection(currentId)
    }

    updateActiveLink()
    window.addEventListener('scroll', updateActiveLink, { passive: true })
    window.addEventListener('resize', updateActiveLink)
    return () => {
      window.removeEventListener('scroll', updateActiveLink)
      window.removeEventListener('resize', updateActiveLink)
    }
  }, [])

  useEffect(() => {
    if (blogModalIndex) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }

    document.body.style.overflow = ''
    return undefined
  }, [blogModalIndex])

  useEffect(() => {
    if (!blogModalIndex) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setBlogModalIndex(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [blogModalIndex])

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    const offset = window.matchMedia('(min-width: 1024px)').matches ? 132 : 20
    const targetTop = target.getBoundingClientRect().top + window.scrollY - offset
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    scrollToSection(id)
    history.pushState(null, '', `#${id}`)
  }

  const normalizedPhone = String(content.phoneNumber || '').replace(/\s+/g, '')
  const phoneHref = normalizedPhone ? `tel:${normalizedPhone}` : '#'
  const whatsappHref = normalizedPhone ? `https://wa.me/${normalizedPhone.replace(/^\+/, '')}` : '#'
  const emailHref = content.email ? `mailto:${content.email}` : '#'
  const blogCards = useMemo(
    () => [
      {
        index: '1',
        title: content.blog1Title,
        summary: content.blog1Description,
        body: content.blog1Body,
        url: content.blog1Url,
        image: BLOG_IMAGES['1'],
      },
      {
        index: '2',
        title: content.blog2Title,
        summary: content.blog2Description,
        body: content.blog2Body,
        url: content.blog2Url,
        image: BLOG_IMAGES['2'],
      },
      {
        index: '3',
        title: content.blog3Title,
        summary: content.blog3Description,
        body: content.blog3Body,
        url: content.blog3Url,
        image: BLOG_IMAGES['3'],
      },
    ],
    [content],
  )

  const blogModalContent = useMemo(() => {
    const selected = blogCards.find((card) => card.index === (blogModalIndex || '1'))
    return selected || blogCards[0]
  }, [blogCards, blogModalIndex])

  const openBlogModal = (index: string) => {
    setBlogModalIndex(index)
  }

  const closeBlogModal = () => {
    setBlogModalIndex(null)
  }

  return (
    <div className="main-container">
      <header className="hero">
        <div className="hero-orb hero-orb--one"></div>
        <div className="hero-orb hero-orb--two"></div>
        <div className="hero-orb hero-orb--three"></div>
        <div className="container">
          <nav className="top-nav">
            <div id="primary-nav" className="nav-links">
              {NAV_SECTIONS.map((section) => (
                <a
                  key={section}
                  href={`#${section}`}
                  className={activeSection === section ? 'active' : undefined}
                  onClick={(event) => handleNavClick(event, section)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </a>
              ))}
            </div>
          </nav>

          <div className="hero-intro">
            <div className="hero-copy">
              <p className="eyebrow">
                Portfolio · Dhaka, Bangladesh · <span id="local-time" aria-live="polite">{localTime}</span>
              </p>
              <h1 id="hero-name">{content.heroName}</h1>
              <p id="hero-subtitle" className="subtitle">
                {content.heroSubtitle}
              </p>
              <p id="hero-text" className="hero-text">
                {content.heroText}
              </p>
              <div className="hero-actions">
                <a id="hero-contact-btn" href="#contact" className="btn" onClick={(event) => handleNavClick(event, 'contact')}>
                  {content.heroPrimaryButtonLabel}
                </a>
                <a id="hero-projects-btn" href="#projects" className="btn ghost" onClick={(event) => handleNavClick(event, 'projects')}>
                  {content.heroSecondaryButtonLabel}
                </a>
                <a
                  id="hero-resume-btn"
                  href="/assets/resume-koushik.pdf"
                  className="btn ghost"
                  download
                >
                  {content.heroResumeButtonLabel}
                </a>
              </div>
            </div>
            <div className="hero-photo">
              <img src="/assets/profile.png" alt="Ariful Islam Koushik" loading="lazy" />
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-icon" aria-hidden="true">
                ⚡
              </span>
              <div>
                <p className="stat-value">6+ Years</p>
                <p className="stat-label">Operations Leadership</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" aria-hidden="true">
                🧭
              </span>
              <div>
                <p className="stat-value">24/7</p>
                <p className="stat-label">Technical Ops Coverage</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" aria-hidden="true">
                🚚
              </span>
              <div>
                <p className="stat-value">10–15 Min</p>
                <p className="stat-label">Instant Delivery Fulfillment</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="about" className="section">
          <div className="container">
            <h2>
              <span className="section-icon" aria-hidden="true">
                ✨
              </span>
              <span id="about-title">{content.aboutTitle}</span>
            </h2>
            <p id="about-paragraph-1">{content.aboutParagraph1}</p>
            <p id="about-paragraph-2">{content.aboutParagraph2}</p>
          </div>
        </section>

        <section id="skills" className="section bg-light">
          <div className="container">
            <h2>
              <span className="section-icon" aria-hidden="true">
                🧩
              </span>
              <span id="skills-title">{content.skillsTitle}</span>
            </h2>

            <div className="grid">
              <div className="card">
                <h3 id="skills-card-1-title">{content.skillsCard1Title}</h3>
                <ul id="skills-card-1-list">
                  {splitLines(content.skillsCard1Items).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3 id="skills-card-2-title">{content.skillsCard2Title}</h3>
                <ul id="skills-card-2-list">
                  {splitLines(content.skillsCard2Items).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3 id="skills-card-3-title">{content.skillsCard3Title}</h3>
                <ul id="skills-card-3-list">
                  {splitLines(content.skillsCard3Items).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3 id="skills-card-4-title">{content.skillsCard4Title}</h3>
                <ul id="skills-card-4-list">
                  {splitLines(content.skillsCard4Items).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="container">
            <h2>
              <span className="section-icon" aria-hidden="true">
                🛠️
              </span>
              <span id="experience-title">{content.experienceTitle}</span>
            </h2>

            <div className="experience-item">
              <h3 id="experience-item-1-title">{content.experienceItem1Title}</h3>
              <span id="experience-item-1-meta">{content.experienceItem1Meta}</span>
              <ul id="experience-item-1-list">
                {splitLines(content.experienceItem1Bullets).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="experience-item">
              <h3 id="experience-item-2-title">{content.experienceItem2Title}</h3>
              <span id="experience-item-2-meta">{content.experienceItem2Meta}</span>
              <ul id="experience-item-2-list">
                {splitLines(content.experienceItem2Bullets).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="experience-item">
              <h3 id="experience-item-3-title">{content.experienceItem3Title}</h3>
              <span id="experience-item-3-meta">{content.experienceItem3Meta}</span>
              <ul id="experience-item-3-list">
                {splitLines(content.experienceItem3Bullets).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="projects" className="section bg-light">
          <div className="container">
            <h2>
              <span className="section-icon" aria-hidden="true">
                🚀
              </span>
              <span id="projects-title">{content.projectsTitle}</span>
            </h2>

            <div className="grid">
              <div className="card">
                <h3 id="project-1-title">{content.project1Title}</h3>
                <p id="project-1-description">{content.project1Description}</p>
              </div>

              <div className="card">
                <h3 id="project-2-title">{content.project2Title}</h3>
                <p id="project-2-description">{content.project2Description}</p>
              </div>

              <div className="card">
                <h3 id="project-3-title">{content.project3Title}</h3>
                <p id="project-3-description">{content.project3Description}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="blog" className="section">
          <div className="container">
            <h2>
              <span className="section-icon" aria-hidden="true">
                📝
              </span>
              <span id="blog-title">{content.blogTitle}</span>
            </h2>

            <div className="grid">
              {blogCards.map((card) => (
                <article
                  key={card.index}
                  id={`blog-card-${card.index}`}
                  className="card blog-card"
                  tabIndex={0}
                  onClick={() => openBlogModal(card.index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openBlogModal(card.index)
                    }
                  }}
                >
                  <img
                    id={`blog-${card.index}-image`}
                    src={card.image}
                    alt={`Cover image for ${card.title}`}
                    loading="lazy"
                  />
                  <h3>
                    <a
                      id={`blog-${card.index}-link`}
                      href="#"
                      aria-label={`Read blog post: ${card.title}`}
                      onClick={(event) => {
                        event.preventDefault()
                        openBlogModal(card.index)
                      }}
                    >
                      <span id={`blog-${card.index}-title`}>{card.title}</span>
                    </a>
                  </h3>
                  <p id={`blog-${card.index}-description`}>{card.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="education" className="section">
          <div className="container">
            <h2>
              <span className="section-icon" aria-hidden="true">
                🎓
              </span>
              <span id="education-title">{content.educationTitle}</span>
            </h2>
            <p>
              <strong id="education-degree">{content.educationDegree}</strong>
              <br />
              <span id="education-institution-years">{content.educationInstitutionYears}</span>
            </p>
          </div>
        </section>

        <section id="contact" className="section contact-spacer" aria-hidden="true"></section>
      </main>

      <nav className="quick-nav" aria-label="Quick section navigation">
        {NAV_SECTIONS.map((section) => (
          <a
            key={section}
            href={`#${section}`}
            className={activeSection === section ? 'active' : undefined}
            onClick={(event) => handleNavClick(event, section)}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </a>
        ))}
      </nav>

      <footer className="footer footer-contact">
        <div className="container">
          <div className="footer-contact__inner">
            <div className="footer-contact__copy">
              <p className="footer-contact__title" id="contact-title">{content.contactTitle}</p>
              <p className="footer-contact__subtitle">Let’s build something reliable together.</p>
            </div>
            <div className="contact-icons">
              <a
                id="contact-phone-link"
                className="contact-icon-btn is-phone"
                href={phoneHref}
                aria-label="Call phone"
              >
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path d="M6.6 3.5h3.1c.6 0 1.1.4 1.2 1l.5 2.7c.1.6-.2 1.2-.7 1.5l-1.6.9a12.4 12.4 0 0 0 5.3 5.3l.9-1.6c.3-.5.9-.8 1.5-.7l2.7.5c.6.1 1 .6 1 1.2v3.1c0 .7-.6 1.3-1.3 1.3C10.9 19.7 4.3 13 4.3 5.8c0-.7.6-1.3 1.3-1.3z" />
                </svg>
                <span className="contact-tooltip">Phone</span>
              </a>
              <a
                id="contact-whatsapp-link"
                className="contact-icon-btn is-whatsapp"
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp chat"
              >
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path d="M20.5 11.7a8.8 8.8 0 0 1-13 7.6L3 20l.8-4.3A8.8 8.8 0 1 1 20.5 11.7zm-4.4 3.1c-.2-.1-1.3-.7-1.5-.8-.2-.1-.4-.1-.6.1l-.6.7c-.2.2-.3.2-.6.1-1.2-.5-2.2-1.4-3-2.5-.2-.2 0-.4.1-.5l.4-.6c.1-.2.1-.4 0-.6l-.7-1.7c-.1-.3-.3-.3-.6-.3h-.6c-.2 0-.4.1-.5.3-.2.3-.7.9-.7 2.2 0 1.3.7 2.5.8 2.6.1.2 2 3.1 4.9 4.1.7.2 1.2.3 1.6.2.5-.1 1.3-.6 1.5-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3z" />
                </svg>
                <span className="contact-tooltip">WhatsApp</span>
              </a>
              <a id="contact-email-link" className="contact-icon-btn is-email" href={emailHref} aria-label="Send email">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path d="M4.6 6.1h14.8c.6 0 1.1.5 1.1 1.1v9.7c0 .6-.5 1.1-1.1 1.1H4.6c-.6 0-1.1-.5-1.1-1.1V7.2c0-.6.5-1.1 1.1-1.1zm.8 2.2v8.1h13.2V8.3l-6.6 4.4-6.6-4.4zm.7-1.3l6 4 6-4H6.1z" />
                </svg>
                <span className="contact-tooltip">Email</span>
              </a>
              <a
                id="contact-linkedin-link"
                className="contact-icon-btn is-linkedin"
                href={content.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn profile"
              >
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path d="M6.5 9.1H3.6V20h2.9V9.1zm-1.4-4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM20.5 14c0-3-1.6-4.4-3.8-4.4-1.8 0-2.6 1-3.1 1.6V9.1H10.7V20h2.9v-6.1c0-1.6.3-3.2 2.3-3.2 2 0 2 1.9 2 3.3V20h2.9V14z" />
                </svg>
                <span className="contact-tooltip">LinkedIn</span>
              </a>
            </div>
          </div>
          <div className="footer-contact__bottom">
            <p>
              © {new Date().getFullYear()} <span id="footer-name">{content.footerName}</span>
            </p>
          </div>
        </div>
      </footer>

      {blogModalIndex && (
        <div id="blog-modal" className="blog-modal" role="dialog" aria-modal="true" aria-labelledby="blog-modal-title">
          <div className="blog-modal__overlay" onClick={closeBlogModal}></div>
          <article className="blog-modal__panel">
            <button
              type="button"
              className="blog-modal__close"
              aria-label="Close blog popup"
              onClick={closeBlogModal}
            >
              ×
            </button>
            <img id="blog-modal-image" className="blog-modal__image" src={blogModalContent.image} alt={blogModalContent.title} />
            <div className="blog-modal__content">
              <h3 id="blog-modal-title">{blogModalContent.title}</h3>
              <p id="blog-modal-summary" className="blog-modal__summary">
                {blogModalContent.summary}
              </p>
              <div
                id="blog-modal-body"
                className="blog-modal__body"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(blogModalContent.body || '') }}
              ></div>
              {blogModalContent.url && blogModalContent.url !== '#' ? (
                <a
                  id="blog-modal-link"
                  className="btn ghost"
                  href={blogModalContent.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Original Post
                </a>
              ) : (
                <a id="blog-modal-link" className="btn ghost is-hidden" href="#" aria-hidden="true">
                  Open Original Post
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </div>
  )
}

export default App
