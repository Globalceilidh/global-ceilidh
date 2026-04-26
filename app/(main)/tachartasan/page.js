'use client';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const sampleEvents = [
  {
    id: 1,
    name: "Grandfather Mountain Highland Games",
    date: "July 10-13, 2026",
    location: "Banner Elk, NC, USA",
    organiser: "Grandfather Mountain Stewardship Foundation",
    description: "One of the largest Scottish Highland Games in North America. Piping, athletics, dancing, and Gaelic language activities.",
    website: "https://grandfathermountain.com",
    category: "Highland Games",
  },
  {
    id: 2,
    name: "Grandfather Mountain Gaelic Song & Language Week",
    date: "July 2026",
    location: "Banner Elk, NC, USA",
    organiser: "ACGA — An Comunn Gàidhealach Ameireaganach",
    description: "A week of Scottish Gaelic song and language instruction with visiting teachers from Scotland.",
    website: "https://acgamerica.org",
    category: "Language",
  },
  {
    id: 3,
    name: "Fergus Scottish Festival",
    date: "August 2026",
    location: "Fergus, Ontario, Canada",
    organiser: "Fergus Scottish Festival",
    description: "Canada's premier Scottish festival — piping, heavy events, Scottish country dancing, and Celtic culture.",
    website: "https://fergusscottishfestival.com",
    category: "Festival",
  },
];

const categoryColors = {
  'Highland Games': 'bg-tarheel-pale text-tarheel-dark',
  'Language': 'bg-cobalt-light text-cobalt',
  'Festival': 'bg-tarheel-pale text-tarheel-dark',
  'Mòd': 'bg-cobalt-light text-cobalt',
  'Ceilidh': 'bg-tarheel-pale text-tarheel-dark',
};

export default function EventsPage() {
  const { t, language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', date: '', location: '', organiser: '',
    description: '', website: '', category: 'Festival',
    postFacebook: true, postInstagram: true, postX: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In Phase 2 this connects to Make/Integromat for cross-posting
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setForm({ name: '', date: '', location: '', organiser: '', description: '', website: '', category: 'Festival', postFacebook: true, postInstagram: true, postX: true });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gc-bg">

      {/* Hero */}
      <section className="bg-gradient-to-br from-gc-dark to-gc-mid text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-label text-tarheel mb-2">GlobalCeilidh.com</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 tracking-wide">
            {t('events.title')}
          </h1>
          <p className="text-white/70 font-body text-lg max-w-2xl">
            {t('events.subtitle')}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 px-6 py-3 bg-tarheel text-white font-medium rounded-lg hover:bg-tarheel-dark transition-colors font-display tracking-wide text-sm"
          >
            {language === 'gd' ? '+ Cuir Tachartas a-steach' : '+ Submit Your Event'}
          </button>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleEvents.map(event => (
              <div key={event.id} className="bg-white rounded-xl border border-gc-border hover:border-tarheel hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColors[event.category] || 'bg-gray-100 text-gray-600'}`}>
                      {event.category}
                    </span>
                  </div>
                  <h3 className="font-display text-gc-dark font-semibold mb-2 leading-tight">{event.name}</h3>
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-tarheel-dark font-medium">📅 {event.date}</p>
                    <p className="text-sm text-gc-muted">📍 {event.location}</p>
                    <p className="text-sm text-gc-muted">👤 {event.organiser}</p>
                  </div>
                  <p className="text-sm text-gc-muted font-body leading-relaxed mb-4">{event.description}</p>
                  {event.website && (
                    <a href={event.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-tarheel hover:text-tarheel-dark font-medium transition-colors">
                      {language === 'gd' ? 'Tuilleadh fiosrachaidh →' : 'More information →'}
                    </a>
                  )}
                </div>
                {/* Share buttons */}
                <div className="px-6 pb-4 flex gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium">
                    Facebook
                  </button>
                  <button className="text-xs px-3 py-1.5 rounded-md bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors font-medium">
                    Instagram
                  </button>
                  <button className="text-xs px-3 py-1.5 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                    𝕏
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Event Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15, 25, 35, 0.85)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gc-border flex justify-between items-center">
              <div>
                <h2 className="font-display text-gc-dark font-semibold text-lg">
                  {t('events.submit_title')}
                </h2>
                <p className="text-sm text-gc-muted mt-1">{t('events.submit_body')}</p>
              </div>
              <button onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-gc-bg hover:bg-gc-border flex items-center justify-center text-gc-muted transition-colors">
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="font-display text-gc-dark font-semibold mb-2">
                  {language === 'gd' ? 'Tapadh leibh!' : 'Thank you!'}
                </h3>
                <p className="text-gc-muted text-sm">
                  {language === 'gd'
                    ? 'Chaidh do thachartas a chur a-steach. Bidh e ri fhaicinn air GlobalCeilidh.com gu luath.'
                    : 'Your event has been submitted. It will appear on GlobalCeilidh.com shortly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {[
                  { key: 'name', label: t('events.name'), required: true },
                  { key: 'date', label: t('events.date'), required: true, type: 'date' },
                  { key: 'location', label: t('events.location'), required: true },
                  { key: 'organiser', label: t('events.organiser'), required: true },
                  { key: 'website', label: t('events.website'), required: false },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gc-text mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      value={form[field.key]}
                      onChange={e => setForm({...form, [field.key]: e.target.value})}
                      className="w-full px-3 py-2 border border-gc-border rounded-lg text-sm focus:outline-none focus:border-tarheel transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gc-text mb-1">
                    {t('events.description')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gc-border rounded-lg text-sm focus:outline-none focus:border-tarheel transition-colors resize-none"
                  />
                </div>

                {/* Cross-posting options */}
                <div className="pt-2">
                  <p className="text-sm font-medium text-gc-text mb-3">{t('events.push_label')}</p>
                  <div className="flex gap-3">
                    {[
                      { key: 'postFacebook', label: 'Facebook' },
                      { key: 'postInstagram', label: 'Instagram' },
                      { key: 'postX', label: 'X / Twitter' },
                    ].map(option => (
                      <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form[option.key]}
                          onChange={e => setForm({...form, [option.key]: e.target.checked})}
                          className="w-4 h-4 accent-tarheel"
                        />
                        <span className="text-sm text-gc-text">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gc-muted mt-2 italic">
                    {language === 'gd'
                      ? 'Full automation coming in Phase 2 — one-click sharing available now'
                      : 'Full automation coming in Phase 2 — one-click sharing available now'}
                  </p>
                </div>

                <button type="submit"
                  className="w-full py-3 bg-tarheel text-white font-medium rounded-lg hover:bg-tarheel-dark transition-colors font-display tracking-wide text-sm">
                  {t('events.submit_btn')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
