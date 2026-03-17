import { createContext, useContext, useState } from 'react';

const PAGES_KEY = 'newbrand_pages';

const DEFAULT_PAGES = [
  {
    id: 'about',
    title: 'About Us',
    slug: 'about',
    published: true,
    sections: [
      {
        id: 's-about-1',
        type: 'hero',
        content: {
          heading: 'Building the Next Generation of Beauty Brands',
          subheading: 'We partner with creators and influencers to bring world-class cosmetic formulations to market under their own label.',
          backgroundImage: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1400&q=80',
          ctaText: 'Apply for Access',
          ctaUrl: '/account',
          ctaStyle: 'gold',
          textAlign: 'center',
          overlay: true,
        },
      },
      {
        id: 's-about-2',
        type: 'featureGrid',
        content: {
          heading: 'Why Partner With Us',
          features: [
            { icon: '◈', title: 'Premium Formulations', description: 'EU-compliant, dermatologist-tested formulas ready for private label.' },
            { icon: '✦', title: 'Creator-First', description: 'Designed for influencers launching a brand — not just reselling.' },
            { icon: '◎', title: 'Full Support', description: 'From label design to fulfilment, we handle the hard parts.' },
          ],
        },
      },
      {
        id: 's-about-3',
        type: 'richText',
        content: {
          heading: 'Our Story',
          body: 'New Brand was founded to make premium cosmetic manufacturing accessible to the creator economy. We believe the next generation of beauty brands will be built by people with communities, not by corporations.\n\nEvery formula in our catalogue has been developed with EU cosmetic regulations in mind and tested by independent dermatologists. We handle compliance, so you can focus on building your brand.',
          alignment: 'left',
        },
      },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    slug: 'faq',
    published: true,
    sections: [
      {
        id: 's-faq-1',
        type: 'richText',
        content: {
          heading: 'Frequently Asked Questions',
          body: 'Everything you need to know about our wholesale programme.',
          alignment: 'center',
        },
      },
      {
        id: 's-faq-2',
        type: 'faq',
        content: {
          heading: '',
          items: [
            { question: 'Who can apply for a wholesale account?', answer: 'Our programme is open to content creators, influencers, and aspiring brand founders with an engaged audience on any major platform.' },
            { question: 'How long does approval take?', answer: 'We review every application personally and aim to respond within one business day.' },
            { question: 'What is the minimum order?', answer: 'Each product category has its own minimum — see the catalogue for details. Label printing requires a minimum of 77 units of the same bottle format.' },
            { question: 'Do I need to design my own label?', answer: 'Yes — every product must carry your brand label. We provide a label design tool to help you create a professional label.' },
            { question: 'What payment terms are available?', answer: 'Approved accounts are offered Net 30 payment terms. We also accept payment in advance via bank transfer.' },
          ],
        },
      },
      {
        id: 's-faq-3',
        type: 'banner',
        content: {
          text: 'Ready to start?',
          subtext: 'Apply for a wholesale account and get a response within one business day.',
          ctaText: 'Apply Now',
          ctaUrl: '/account',
          style: 'dark',
        },
      },
    ],
  },
];

function loadPages() {
  try {
    const stored = JSON.parse(localStorage.getItem(PAGES_KEY));
    return stored || DEFAULT_PAGES;
  } catch { return DEFAULT_PAGES; }
}

const PagesContext = createContext(null);

export function PagesProvider({ children }) {
  const [pages, setPages] = useState(loadPages);

  function persist(next) {
    setPages(next);
    localStorage.setItem(PAGES_KEY, JSON.stringify(next));
  }

  function createPage(data = {}) {
    const page = {
      id: `page-${Date.now()}`,
      title: 'Untitled Page',
      slug: `new-page-${Date.now()}`,
      published: false,
      sections: [],
      ...data,
    };
    persist([...pages, page]);
    return page;
  }

  function updatePage(id, fields) {
    persist(pages.map(p => p.id === id ? { ...p, ...fields } : p));
  }

  function deletePage(id) {
    persist(pages.filter(p => p.id !== id));
  }

  return (
    <PagesContext.Provider value={{ pages, createPage, updatePage, deletePage }}>
      {children}
    </PagesContext.Provider>
  );
}

export function usePages() {
  return useContext(PagesContext);
}
