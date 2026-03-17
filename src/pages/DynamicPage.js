import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePages } from '../context/PagesContext';
import './DynamicPage.css';

// ── Section renderers ─────────────────────────────────────────────
function HeroSection({ content }) {
  const hasImage = !!content.backgroundImage;
  return (
    <section
      className={`dp-hero dp-hero--${content.textAlign || 'center'}`}
      style={hasImage ? { backgroundImage: `url(${content.backgroundImage})` } : {}}
    >
      {hasImage && content.overlay && <div className="dp-hero-overlay" />}
      <div className="container dp-hero-inner">
        {content.heading && <h1 className="dp-hero-heading">{content.heading}</h1>}
        {content.subheading && <p className="dp-hero-sub">{content.subheading}</p>}
        {content.ctaText && content.ctaUrl && (
          content.ctaUrl.startsWith('/') ? (
            <Link to={content.ctaUrl} className={`dp-cta dp-cta--${content.ctaStyle || 'gold'}`}>
              {content.ctaText}
            </Link>
          ) : (
            <a href={content.ctaUrl} className={`dp-cta dp-cta--${content.ctaStyle || 'gold'}`}
              target="_blank" rel="noopener noreferrer">
              {content.ctaText}
            </a>
          )
        )}
      </div>
    </section>
  );
}

function RichTextSection({ content }) {
  const paragraphs = (content.body || '').split('\n\n').filter(Boolean);
  return (
    <section className={`dp-richtext dp-richtext--${content.alignment || 'left'}`}>
      <div className="container dp-richtext-inner">
        {content.heading && <h2 className="dp-section-heading">{content.heading}</h2>}
        <div className="dp-richtext-body">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </section>
  );
}

function ImageTextSection({ content }) {
  return (
    <section className={`dp-imagetext dp-imagetext--${content.imagePosition || 'left'}`}>
      <div className="container dp-imagetext-inner">
        <div className="dp-imagetext-img">
          {content.imageUrl
            ? <img src={content.imageUrl} alt={content.heading || ''} />
            : <div className="dp-img-placeholder">No image</div>}
        </div>
        <div className="dp-imagetext-text">
          {content.heading && <h2 className="dp-section-heading">{content.heading}</h2>}
          {content.body && <p className="dp-imagetext-body">{content.body}</p>}
          {content.ctaText && content.ctaUrl && (
            content.ctaUrl.startsWith('/') ? (
              <Link to={content.ctaUrl} className="dp-cta dp-cta--gold">{content.ctaText}</Link>
            ) : (
              <a href={content.ctaUrl} className="dp-cta dp-cta--gold" target="_blank" rel="noopener noreferrer">{content.ctaText}</a>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function FeatureGridSection({ content }) {
  return (
    <section className="dp-features">
      <div className="container dp-features-inner">
        {content.heading && <h2 className="dp-section-heading dp-section-heading--center">{content.heading}</h2>}
        <div className="dp-features-grid">
          {(content.features || []).map((f, i) => (
            <div key={i} className="dp-feature-card">
              <span className="dp-feature-icon">{f.icon}</span>
              <h3 className="dp-feature-title">{f.title}</h3>
              <p className="dp-feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ content }) {
  const [open, setOpen] = useState(null);
  const toggle = i => setOpen(o => o === i ? null : i);
  return (
    <section className="dp-faq">
      <div className="container dp-faq-inner">
        {content.heading && <h2 className="dp-section-heading">{content.heading}</h2>}
        <div className="dp-faq-list">
          {(content.items || []).map((item, i) => (
            <div key={i} className={`dp-faq-item ${open === i ? 'dp-faq-item--open' : ''}`}>
              <button className="dp-faq-question" onClick={() => toggle(i)}>
                <span>{item.question}</span>
                <span className="dp-faq-arrow">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className="dp-faq-answer">{item.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BannerSection({ content }) {
  return (
    <section className={`dp-banner dp-banner--${content.style || 'dark'}`}>
      <div className="container dp-banner-inner">
        <div className="dp-banner-text">
          {content.text    && <h2>{content.text}</h2>}
          {content.subtext && <p>{content.subtext}</p>}
        </div>
        {content.ctaText && content.ctaUrl && (
          content.ctaUrl.startsWith('/') ? (
            <Link to={content.ctaUrl} className="dp-cta dp-cta--banner">{content.ctaText}</Link>
          ) : (
            <a href={content.ctaUrl} className="dp-cta dp-cta--banner" target="_blank" rel="noopener noreferrer">{content.ctaText}</a>
          )
        )}
      </div>
    </section>
  );
}

function SpacerSection({ content }) {
  const heights = { small: '1rem', medium: '3rem', large: '6rem' };
  return <div style={{ height: heights[content.size] || '3rem' }} />;
}

const RENDERERS = {
  hero:        HeroSection,
  richText:    RichTextSection,
  imageText:   ImageTextSection,
  featureGrid: FeatureGridSection,
  faq:         FaqSection,
  banner:      BannerSection,
  spacer:      SpacerSection,
};

// ── Main DynamicPage ──────────────────────────────────────────────
export default function DynamicPage() {
  const { slug } = useParams();
  const { pages } = usePages();
  const page = pages.find(p => p.slug === slug);

  if (!page) {
    return (
      <div className="dp-not-found container">
        <h1>Page not found</h1>
        <p>This page doesn't exist or hasn't been published yet.</p>
        <Link to="/products">← Back to catalogue</Link>
      </div>
    );
  }

  if (!page.published) {
    return (
      <div className="dp-not-found container">
        <h1>{page.title}</h1>
        <p>This page is not yet published.</p>
        <Link to="/products">← Back to catalogue</Link>
      </div>
    );
  }

  return (
    <div className="dp-page">
      {page.sections.map(section => {
        const Renderer = RENDERERS[section.type];
        if (!Renderer) return null;
        return <Renderer key={section.id} content={section.content} />;
      })}
    </div>
  );
}
