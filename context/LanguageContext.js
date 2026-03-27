'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  // Navigation
  nav: {
    learn: { en: 'Learn', gd: 'Ionnsaich' },
    news: { en: 'News', gd: 'Naidheachd' },
    events: { en: 'Events', gd: 'Tachartasan' },
    community: { en: 'Community', gd: 'Coimhearsnachd' },
    media: { en: 'Media', gd: 'Meadhanan' },
    about: { en: 'About', gd: 'Mu Dheidhinn' },
  },
  // Homepage
  home: {
    welcome: {
      en: 'Welcome to GlobalCeilidh.com',
      gd: 'Fàilte gu GlobalCeilidh.com'
    },
    tagline: {
      en: 'The global home of Scottish Gaelic language, culture and community.',
      gd: 'Dachaigh cruinneil cànan, cultar agus coimhearsnachd na Gàidhlig.'
    },
    cta_learn: {
      en: 'Start Learning',
      gd: 'Tòisich ag Ionnsachadh'
    },
    cta_community: {
      en: 'Join the Community',
      gd: 'Bi nad bhall den Choimhearsnachd'
    },
    mission_title: {
      en: 'A Gathering Place for the Global Gael',
      gd: 'Àite Cruinneachaidh airson a\' Ghàidheil Cruinneil'
    },
    mission_body: {
      en: 'Sixty to seventy percent of people engaging with Scottish Gaelic culture online are outside the United Kingdom. This platform was built for them — for you — wherever in the world your journey has taken you.',
      gd: 'Tha seasgad gu seachdad sa cheud de na daoine a tha a\' com-pàirteachadh le cultar na Gàidhlig air-loidhne taobh a-muigh na Rìoghachd Aonaichte. Chaidh an làrach-lìn seo a thogail airson na daoine sin — airson tusa — ge b\'e càit an tug do thuras thu.'
    },
  },
  // Learn page
  learn: {
    title: { en: 'Learn Scottish Gaelic', gd: 'Ionnsaich Gàidhlig' },
    subtitle: { en: 'With Aileen — Your AI Gàidhlig Tutor', gd: 'Le Aileen — Do Thidsear Gàidhlig AI' },
    guide_btn: { en: 'Download Lesson Guide', gd: 'Luchdaich a-nuas Treòrachadh an Leasan' },
    level_begin: { en: 'Beginner', gd: 'Tòiseachadh' },
    level_mid: { en: 'Intermediate', gd: 'Meadhanach' },
    level_adv: { en: 'Advanced', gd: 'Adhartach' },
  },
  // Events page
  events: {
    title: { en: 'Events', gd: 'Tachartasan' },
    subtitle: { en: 'Gaelic events worldwide — find them here first', gd: 'Tachartasan Gàidhlig air feadh an t-saoghail — lorg an seo iad an toiseach' },
    submit_title: { en: 'Submit Your Event', gd: 'Cuir a-steach Do Thachartas' },
    submit_body: { en: 'Post once — reach every Gaelic community platform worldwide.', gd: 'Post aon uair — ruig gach àrd-ùrlar coimhearsnachd Gàidhlig air feadh an t-saoghail.' },
    name: { en: 'Event Name', gd: 'Ainm an Tachartais' },
    date: { en: 'Date', gd: 'Ceann-latha' },
    location: { en: 'Location', gd: 'Àite' },
    description: { en: 'Description', gd: 'Tuairisgeul' },
    organiser: { en: 'Organiser', gd: 'Luchd-eagrachaidh' },
    website: { en: 'Website / Link', gd: 'Làrach-lìn / Ceangal' },
    submit_btn: { en: 'Submit Event', gd: 'Cuir a-steach Tachartas' },
    push_label: { en: 'Also post to:', gd: 'Post cuideachd gu:' },
  },
  // Community page
  community: {
    title: { en: 'Community', gd: 'Coimhearsnachd' },
    subtitle: { en: 'Every Gaelic organisation — one home', gd: 'Gach buidheann Ghàidhlig — aon dachaigh' },
  },
  // Common
  common: {
    loading: { en: 'Loading...', gd: 'A\' luchdachadh...' },
    back: { en: 'Back', gd: 'Air ais' },
    next: { en: 'Next', gd: 'Adhart' },
    submit: { en: 'Submit', gd: 'Cuir a-steach' },
    close: { en: 'Close', gd: 'Dùin' },
    learn_more: { en: 'Learn more', gd: 'Ionnsaich tuilleadh' },
    formal_badge: { en: 'Formal', gd: 'Foirmeil' },
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('gc_language');
    if (saved) setLanguage(saved);
  }, []);

  const toggleLanguage = () => {
    const next = language === 'en' ? 'gd' : 'en';
    setLanguage(next);
    localStorage.setItem('gc_language', next);
  };

  const t = (path) => {
    const keys = path.split('.');
    let obj = translations;
    for (const key of keys) {
      obj = obj?.[key];
    }
    return obj?.[language] || obj?.en || path;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
