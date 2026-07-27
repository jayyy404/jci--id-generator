const SITE_URL = "https://jciregattailoilo.org";

const mainLogos = [
  { src: "/brand/jci-philippines-footer.png", alt: "JCI Philippines", href: "https://jciphilippines.com/" },
  { src: "/brand/jci-regatta-footer.png", alt: "JCI Regatta", href: SITE_URL },
];

const campaignLogos = [
  { src: "/brand/78-anniversary.png", alt: "78th Anniversary" },
  { src: "/brand/sustain-the-future.png", alt: "Sustain the Future" },
  { src: "/brand/masarig-2026.png", alt: "Masarig 2026" },
  { src: "/brand/innovate4impact.png", alt: "Innovate 4 Impact" },
  { src: "/brand/regatta-2026.png", alt: "Regatta All Aboard" },
];

const quickLinks = [
  { label: "Home", href: SITE_URL },
  { label: "About Us", href: `${SITE_URL}/about` },
  { label: "Projects", href: `${SITE_URL}/projects` },
  { label: "Partners", href: `${SITE_URL}/partners` },
  { label: "Contact", href: `${SITE_URL}/contact` },
  { label: "Be a Member", href: `${SITE_URL}/member`, highlight: true },
];

const projectLinks = [
  { label: "TOSIA", href: `${SITE_URL}/tosia` },
  { label: "Balangaw", href: `${SITE_URL}/projects/balangaw` },
  { label: "Duag kag Kasanag", href: `${SITE_URL}/projects/duagkagkasanag` },
  { label: "Notebook mo", href: `${SITE_URL}/projects/notebookmo` },
  { label: "Area Conference", href: `${SITE_URL}/projects/areaconference` },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/jciregattailoilo",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/jciregattailoilo/",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@jciregattailoilo",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/show/0hiBgDwK287oiZtwXT806i",
    path: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--footer-bg)", color: "var(--white)", marginTop: 32 }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 16px",
          borderBottom: "1px solid var(--footer-border)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {mainLogos.map((logo) => (
            <a key={logo.src} href={logo.href} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.src} alt={logo.alt} style={{ height: 56, width: "auto", objectFit: "contain" }} />
            </a>
          ))}
        </div>
        <div className="footer-divider" aria-hidden="true" />
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {campaignLogos.map((logo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              style={{ height: 32, width: "auto", objectFit: "contain", opacity: 0.9 }}
            />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
        <div className="footer-grid">
          <div>
            <h3
              style={{
                fontSize: 22,
                margin: "0 0 12px",
                background: "linear-gradient(135deg, var(--footer-accent-light), var(--footer-accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              JCI Regatta Iloilo
            </h3>
            <p style={{ color: "var(--footer-muted)", fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>
              A Category 3 Local Organization of JCI Philippines in Iloilo City, Philippines.
              Creating positive change through active citizenship since 2009.
            </p>
            <div className="footer-social-link-row" style={{ display: "flex", gap: 12 }}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="footer-social-link"
                >
                  <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={footerColumnTitleStyle}>Quick Links</h4>
            <ul style={footerLinkListStyle}>
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: link.highlight ? "var(--footer-accent)" : "var(--footer-muted)", fontWeight: link.highlight ? 600 : 400 }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={footerColumnTitleStyle}>Our Projects</h4>
            <ul style={footerLinkListStyle}>
              {projectLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noreferrer" style={{ color: "var(--footer-muted)" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={footerColumnTitleStyle}>Get in Touch</h4>
            <ul style={{ ...footerLinkListStyle, gap: 14 }}>
              <li style={{ color: "var(--footer-muted)", fontSize: 14, lineHeight: 1.6 }}>
                CPK Building Mabini St. Liberation, Iloilo City
              </li>
              <li>
                <a href="mailto:jciregatta09@gmail.com" style={{ color: "var(--footer-muted)" }}>
                  jciregatta09@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--footer-border)", padding: "16px" }}>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--footer-muted)", margin: 0 }}>
          © {year} JCI Regatta Iloilo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

const footerColumnTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "var(--white)",
  margin: "0 0 18px",
};

const footerLinkListStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  fontSize: 14,
};
