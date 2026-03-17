import { useState, useRef } from 'react';
import { usePages } from '../context/PagesContext';
import './PageBuilder.css';

// ── Section type registry ─────────────────────────────────────────
export const SECTION_TYPES = {
  hero: {
    label: 'Hero',
    icon: '◭',
    description: 'Full-width banner with heading, subheading, and CTA',
    defaultContent: {
      heading: 'Your Headline Here',
      subheading: 'A supporting line that explains your value proposition.',
      backgroundImage: '',
      ctaText: 'Get Started',
      ctaUrl: '/account',
      ctaStyle: 'gold',
      textAlign: 'center',
      overlay: true,
    },
  },
  richText: {
    label: 'Rich Text',
    icon: '≡',
    description: 'Heading with formatted text content',
    defaultContent: {
      heading: '',
      body: 'Write your content here…',
      alignment: 'left',
    },
  },
  imageText: {
    label: 'Image + Text',
    icon: '⊟',
    description: 'Side-by-side image and text block',
    defaultContent: {
      heading: '',
      body: '',
      imageUrl: '',
      imagePosition: 'left',
      ctaText: '',
      ctaUrl: '',
    },
  },
  featureGrid: {
    label: 'Feature Grid',
    icon: '⊞',
    description: '3-column grid of feature highlights',
    defaultContent: {
      heading: '',
      features: [
        { icon: '◈', title: 'Feature One', description: 'Describe this feature briefly.' },
        { icon: '✦', title: 'Feature Two', description: 'Describe this feature briefly.' },
        { icon: '◎', title: 'Feature Three', description: 'Describe this feature briefly.' },
      ],
    },
  },
  faq: {
    label: 'FAQ',
    icon: '?',
    description: 'Accordion of questions and answers',
    defaultContent: {
      heading: 'Frequently Asked Questions',
      items: [
        { question: 'Question one?', answer: 'Answer one.' },
        { question: 'Question two?', answer: 'Answer two.' },
      ],
    },
  },
  banner: {
    label: 'Banner',
    icon: '▬',
    description: 'Full-width coloured call-to-action strip',
    defaultContent: {
      text: 'Ready to get started?',
      subtext: '',
      ctaText: 'Apply Now',
      ctaUrl: '/account',
      style: 'dark',
    },
  },
  spacer: {
    label: 'Spacer',
    icon: '—',
    description: 'Empty vertical space',
    defaultContent: { size: 'medium' },
  },
};

// ── Shared form primitives ────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="pb-field">
      {label && <label className="pb-field-label">{label}</label>}
      {children}
      {hint && <span className="pb-field-hint">{hint}</span>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, large }) {
  return large
    ? <textarea className="pb-input pb-textarea" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={5} />
    : <input   className="pb-input" type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div className="pb-radio-group">
      {options.map(opt => (
        <label key={opt.value} className={`pb-radio ${value === opt.value ? 'active' : ''}`}>
          <input type="radio" name={opt.name || 'rg'} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function ImageField({ value, onChange }) {
  const ref = useRef(null);
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max 2 MB — use a URL instead for larger images.'); return; }
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }
  return (
    <div className="pb-image-field">
      {value && <img src={value} alt="" className="pb-image-preview" />}
      <div className="pb-image-row">
        <input className="pb-input pb-input--flex" type="url" value={value} onChange={e => onChange(e.target.value)} placeholder="https://…" />
        <button className="pb-upload-btn" onClick={() => ref.current.click()}>↑ Upload</button>
        <input ref={ref} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
    </div>
  );
}

// ── Section editors ───────────────────────────────────────────────
function HeroEditor({ content, onChange }) {
  const set = (k, v) => onChange({ ...content, [k]: v });
  return (
    <>
      <Field label="Heading"><TextInput value={content.heading} onChange={v => set('heading', v)} placeholder="Main headline" /></Field>
      <Field label="Subheading"><TextInput value={content.subheading} onChange={v => set('subheading', v)} placeholder="Supporting text" large /></Field>
      <Field label="Background Image"><ImageField value={content.backgroundImage} onChange={v => set('backgroundImage', v)} /></Field>
      <Field label="Text Alignment">
        <RadioGroup value={content.textAlign} onChange={v => set('textAlign', v)} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }]} />
      </Field>
      <Field label="Dark Overlay">
        <label className="pb-toggle">
          <input type="checkbox" checked={content.overlay} onChange={e => set('overlay', e.target.checked)} />
          <span className="pb-toggle-track" />
          <span className="pb-toggle-label">Darken background image</span>
        </label>
      </Field>
      <Field label="CTA Button Text"><TextInput value={content.ctaText} onChange={v => set('ctaText', v)} placeholder="e.g. Apply for Access" /></Field>
      <Field label="CTA Button URL"><TextInput value={content.ctaUrl} onChange={v => set('ctaUrl', v)} placeholder="/account or https://…" /></Field>
      <Field label="Button Style">
        <RadioGroup value={content.ctaStyle || 'gold'} onChange={v => set('ctaStyle', v)}
          options={[{ value: 'gold', label: 'Gold' }, { value: 'white', label: 'White' }, { value: 'dark', label: 'Dark' }]} />
      </Field>
    </>
  );
}

function RichTextEditor({ content, onChange }) {
  const set = (k, v) => onChange({ ...content, [k]: v });
  return (
    <>
      <Field label="Heading"><TextInput value={content.heading} onChange={v => set('heading', v)} placeholder="Section heading (optional)" /></Field>
      <Field label="Body Text" hint="Use blank lines to create paragraphs">
        <TextInput value={content.body} onChange={v => set('body', v)} placeholder="Write your content here…" large />
      </Field>
      <Field label="Alignment">
        <RadioGroup value={content.alignment} onChange={v => set('alignment', v)} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }]} />
      </Field>
    </>
  );
}

function ImageTextEditor({ content, onChange }) {
  const set = (k, v) => onChange({ ...content, [k]: v });
  return (
    <>
      <Field label="Heading"><TextInput value={content.heading} onChange={v => set('heading', v)} placeholder="Section heading" /></Field>
      <Field label="Body Text"><TextInput value={content.body} onChange={v => set('body', v)} placeholder="Supporting copy…" large /></Field>
      <Field label="Image"><ImageField value={content.imageUrl} onChange={v => set('imageUrl', v)} /></Field>
      <Field label="Image Position">
        <RadioGroup value={content.imagePosition} onChange={v => set('imagePosition', v)} options={[{ value: 'left', label: 'Image Left' }, { value: 'right', label: 'Image Right' }]} />
      </Field>
      <Field label="CTA Text"><TextInput value={content.ctaText} onChange={v => set('ctaText', v)} placeholder="Optional button label" /></Field>
      <Field label="CTA URL"><TextInput value={content.ctaUrl} onChange={v => set('ctaUrl', v)} placeholder="/products" /></Field>
    </>
  );
}

function FeatureGridEditor({ content, onChange }) {
  const set = (k, v) => onChange({ ...content, [k]: v });
  function setFeature(i, k, v) {
    const features = content.features.map((f, fi) => fi === i ? { ...f, [k]: v } : f);
    onChange({ ...content, features });
  }
  function addFeature() {
    onChange({ ...content, features: [...content.features, { icon: '◆', title: '', description: '' }] });
  }
  function removeFeature(i) {
    onChange({ ...content, features: content.features.filter((_, fi) => fi !== i) });
  }
  return (
    <>
      <Field label="Section Heading"><TextInput value={content.heading} onChange={v => set('heading', v)} placeholder="e.g. Why Choose Us" /></Field>
      {content.features.map((f, i) => (
        <div key={i} className="pb-feature-block">
          <div className="pb-feature-block-header">
            <span className="pb-feature-num">Feature {i + 1}</span>
            <button className="pb-remove-btn" onClick={() => removeFeature(i)}>Remove</button>
          </div>
          <div className="pb-feature-row">
            <input className="pb-input pb-input--icon" value={f.icon} onChange={e => setFeature(i, 'icon', e.target.value)} placeholder="◈" maxLength={2} />
            <input className="pb-input pb-input--flex" value={f.title} onChange={e => setFeature(i, 'title', e.target.value)} placeholder="Feature title" />
          </div>
          <TextInput value={f.description} onChange={v => setFeature(i, 'description', v)} placeholder="Brief description" />
        </div>
      ))}
      {content.features.length < 6 && (
        <button className="pb-add-item-btn" onClick={addFeature}>+ Add Feature</button>
      )}
    </>
  );
}

function FaqEditor({ content, onChange }) {
  const set = (k, v) => onChange({ ...content, [k]: v });
  function setItem(i, k, v) {
    const items = content.items.map((item, ii) => ii === i ? { ...item, [k]: v } : item);
    onChange({ ...content, items });
  }
  function addItem() {
    onChange({ ...content, items: [...content.items, { question: '', answer: '' }] });
  }
  function removeItem(i) {
    onChange({ ...content, items: content.items.filter((_, ii) => ii !== i) });
  }
  function moveItem(i, dir) {
    const items = [...content.items];
    const target = i + dir;
    if (target < 0 || target >= items.length) return;
    [items[i], items[target]] = [items[target], items[i]];
    onChange({ ...content, items });
  }
  return (
    <>
      <Field label="Section Heading"><TextInput value={content.heading} onChange={v => set('heading', v)} placeholder="Optional heading" /></Field>
      {content.items.map((item, i) => (
        <div key={i} className="pb-faq-block">
          <div className="pb-faq-block-header">
            <span>Q{i + 1}</span>
            <div className="pb-faq-actions">
              {i > 0 && <button onClick={() => moveItem(i, -1)}>↑</button>}
              {i < content.items.length - 1 && <button onClick={() => moveItem(i, 1)}>↓</button>}
              <button className="pb-remove-btn" onClick={() => removeItem(i)}>Remove</button>
            </div>
          </div>
          <TextInput value={item.question} onChange={v => setItem(i, 'question', v)} placeholder="Question…" />
          <div style={{ marginTop: '0.4rem' }}>
            <TextInput value={item.answer} onChange={v => setItem(i, 'answer', v)} placeholder="Answer…" large />
          </div>
        </div>
      ))}
      <button className="pb-add-item-btn" onClick={addItem}>+ Add Question</button>
    </>
  );
}

function BannerEditor({ content, onChange }) {
  const set = (k, v) => onChange({ ...content, [k]: v });
  return (
    <>
      <Field label="Heading"><TextInput value={content.text} onChange={v => set('text', v)} placeholder="Banner heading" /></Field>
      <Field label="Subtext"><TextInput value={content.subtext} onChange={v => set('subtext', v)} placeholder="Optional supporting line" /></Field>
      <Field label="CTA Text"><TextInput value={content.ctaText} onChange={v => set('ctaText', v)} placeholder="Button label" /></Field>
      <Field label="CTA URL"><TextInput value={content.ctaUrl} onChange={v => set('ctaUrl', v)} placeholder="/account" /></Field>
      <Field label="Style">
        <RadioGroup value={content.style} onChange={v => set('style', v)}
          options={[{ value: 'dark', label: 'Dark' }, { value: 'gold', label: 'Gold' }, { value: 'light', label: 'Light' }]} />
      </Field>
    </>
  );
}

function SpacerEditor({ content, onChange }) {
  return (
    <Field label="Height">
      <RadioGroup value={content.size} onChange={v => onChange({ ...content, size: v })}
        options={[{ value: 'small', label: 'Small (1rem)' }, { value: 'medium', label: 'Medium (3rem)' }, { value: 'large', label: 'Large (6rem)' }]} />
    </Field>
  );
}

const EDITORS = { hero: HeroEditor, richText: RichTextEditor, imageText: ImageTextEditor, featureGrid: FeatureGridEditor, faq: FaqEditor, banner: BannerEditor, spacer: SpacerEditor };

// ── Section sidebar item ──────────────────────────────────────────
function SectionItem({ section, index, total, selected, onSelect, onMove, onRemove }) {
  const type = SECTION_TYPES[section.type];
  const preview = section.content?.heading || section.content?.text || section.content?.body?.slice(0, 40) || '';
  return (
    <div className={`pb-section-item ${selected ? 'pb-section-item--selected' : ''}`} onClick={onSelect}>
      <div className="pb-section-item-icon">{type?.icon || '□'}</div>
      <div className="pb-section-item-info">
        <span className="pb-section-item-type">{type?.label || section.type}</span>
        {preview && <span className="pb-section-item-preview">{preview}</span>}
      </div>
      <div className="pb-section-item-controls" onClick={e => e.stopPropagation()}>
        <button disabled={index === 0}         onClick={() => onMove(index, -1)} title="Move up">↑</button>
        <button disabled={index === total - 1} onClick={() => onMove(index,  1)} title="Move down">↓</button>
        <button className="pb-section-remove" onClick={() => { if (window.confirm('Remove this section?')) onRemove(index); }} title="Remove">✕</button>
      </div>
    </div>
  );
}

// ── Add section picker ────────────────────────────────────────────
function AddSectionPicker({ onAdd, onClose }) {
  return (
    <div className="pb-add-picker">
      <div className="pb-add-picker-header">
        <span>Add Section</span>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="pb-add-picker-grid">
        {Object.entries(SECTION_TYPES).map(([key, def]) => (
          <button key={key} className="pb-add-type-card" onClick={() => onAdd(key)}>
            <span className="pb-add-type-icon">{def.icon}</span>
            <span className="pb-add-type-label">{def.label}</span>
            <span className="pb-add-type-desc">{def.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page editor (builder) ─────────────────────────────────────────
function PageEditor({ page, onSave, onBack }) {
  const [sections,      setSections]      = useState(() => page.sections.map(s => ({ ...s, content: { ...s.content } })));
  const [title,         setTitle]         = useState(page.title);
  const [slug,          setSlug]          = useState(page.slug);
  const [published,     setPublished]     = useState(page.published);
  const [selectedIdx,   setSelectedIdx]   = useState(sections.length > 0 ? 0 : null);
  const [showPicker,    setShowPicker]    = useState(false);
  const [saved,         setSaved]         = useState(false);

  const selectedSection = selectedIdx !== null ? sections[selectedIdx] : null;

  function moveSection(index, dir) {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    setSelectedIdx(target);
  }

  function removeSection(index) {
    const next = sections.filter((_, i) => i !== index);
    setSections(next);
    setSelectedIdx(next.length > 0 ? Math.min(index, next.length - 1) : null);
  }

  function addSection(type) {
    const section = {
      id: `s-${Date.now()}`,
      type,
      content: { ...SECTION_TYPES[type].defaultContent },
    };
    const next = [...sections, section];
    setSections(next);
    setSelectedIdx(next.length - 1);
    setShowPicker(false);
  }

  function updateSelectedContent(content) {
    setSections(prev => prev.map((s, i) => i === selectedIdx ? { ...s, content } : s));
  }

  function handleSave() {
    onSave(page.id, { title, slug, published, sections });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const Editor = selectedSection ? EDITORS[selectedSection.type] : null;

  return (
    <div className="pb-page-editor">
      {/* Top bar */}
      <div className="pb-editor-topbar">
        <button className="admin-back-btn" onClick={onBack}>← Pages</button>
        <input
          className="pb-page-title-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Page title"
        />
        <div className="pb-editor-topbar-right">
          <label className="pb-published-toggle">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
            <span className="pb-toggle-track" />
            <span>{published ? 'Published' : 'Draft'}</span>
          </label>
          <button className="admin-btn admin-btn--approve" onClick={handleSave}>
            {saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>

      {/* Slug */}
      <div className="pb-slug-row">
        <span className="pb-slug-prefix">Page URL: /pages/</span>
        <input
          className="pb-slug-input"
          value={slug}
          onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
          placeholder="page-slug"
        />
        {published && (
          <a
            className="pb-slug-link"
            href={`/pages/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview ↗
          </a>
        )}
      </div>

      {/* Builder layout */}
      <div className="pb-builder-layout">
        {/* LEFT: section list sidebar */}
        <div className="pb-sidebar">
          <div className="pb-sidebar-header">
            <span>Sections</span>
            <span className="pb-sidebar-count">{sections.length}</span>
          </div>

          {sections.length === 0 && (
            <div className="pb-sidebar-empty">No sections yet. Add one below.</div>
          )}

          {sections.map((section, i) => (
            <SectionItem
              key={section.id}
              section={section}
              index={i}
              total={sections.length}
              selected={selectedIdx === i}
              onSelect={() => setSelectedIdx(i)}
              onMove={moveSection}
              onRemove={removeSection}
            />
          ))}

          {showPicker ? (
            <AddSectionPicker onAdd={addSection} onClose={() => setShowPicker(false)} />
          ) : (
            <button className="pb-add-section-btn" onClick={() => setShowPicker(true)}>
              + Add Section
            </button>
          )}
        </div>

        {/* RIGHT: section editor */}
        <div className="pb-section-editor">
          {!selectedSection ? (
            <div className="pb-section-editor-empty">
              <span className="pb-empty-icon">□</span>
              <p>Select a section from the left to edit it,<br/>or click <strong>+ Add Section</strong> to get started.</p>
            </div>
          ) : (
            <>
              <div className="pb-section-editor-header">
                <span className="pb-section-editor-type">
                  {SECTION_TYPES[selectedSection.type]?.icon} {SECTION_TYPES[selectedSection.type]?.label}
                </span>
              </div>
              <div className="pb-section-editor-body">
                {Editor && (
                  <Editor
                    content={selectedSection.content}
                    onChange={updateSelectedContent}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pages list ────────────────────────────────────────────────────
export default function PageBuilderSection() {
  const { pages, createPage, updatePage, deletePage } = usePages();
  const [editingId, setEditingId] = useState(null);

  const editingPage = editingId ? pages.find(p => p.id === editingId) : null;

  function handleSave(id, fields) {
    updatePage(id, fields);
  }

  function handleCreate() {
    const page = createPage();
    setEditingId(page.id);
  }

  if (editingPage) {
    return <PageEditor page={editingPage} onSave={handleSave} onBack={() => setEditingId(null)} />;
  }

  return (
    <div className="pb-pages-list">
      <div className="pb-pages-header">
        <div>
          <h2>Pages</h2>
          <p>Create and manage content pages for your storefront.</p>
        </div>
        <button className="admin-btn admin-btn--approve" onClick={handleCreate}>+ New Page</button>
      </div>

      {pages.length === 0 ? (
        <div className="admin-empty">No pages yet. Create your first page.</div>
      ) : (
        <div className="pb-pages-table">
          <div className="pb-pages-thead">
            <span>Title</span>
            <span>URL</span>
            <span>Sections</span>
            <span>Status</span>
            <span></span>
          </div>
          {pages.map(p => (
            <div key={p.id} className="pb-pages-row">
              <span className="pb-page-title">{p.title}</span>
              <span className="pb-page-slug">/pages/{p.slug}</span>
              <span className="pb-page-sections">{p.sections.length}</span>
              <span>
                <span className={`admin-status-badge ${p.published ? 'admin-status-badge--in' : 'admin-status-badge--hidden'}`}>
                  {p.published ? 'Published' : 'Draft'}
                </span>
              </span>
              <div className="pb-page-actions">
                <button className="admin-btn admin-btn--edit" onClick={() => setEditingId(p.id)}>Edit</button>
                {p.published && (
                  <a className="admin-btn admin-btn--ghost" href={`/pages/${p.slug}`} target="_blank" rel="noopener noreferrer">View ↗</a>
                )}
                <button
                  className="admin-btn admin-btn--reject"
                  onClick={() => { if (window.confirm(`Delete "${p.title}"?`)) deletePage(p.id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
