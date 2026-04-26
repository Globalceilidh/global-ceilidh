'use client';
import { useLanguage } from '@/context/LanguageContext';

const organisations = [
  { name: "Slighe nan Gàidheal", region: "North America", desc: "North American Gaelic organisation connecting diaspora communities across the continent." },
  { name: "An Comunn Gàidhealach Ameireaganach", region: "USA", desc: "Promoting Scottish Gaelic language and culture in the United States." },
  { name: "Colaisde na Gàidhlig", region: "Cape Breton, Canada", desc: "The Gaelic College — teaching Gaelic language, music and culture in Nova Scotia." },
  { name: "Sabhal Mòr Ostaig", region: "Isle of Skye, Scotland", desc: "The National Centre for Gaelic Language and Culture." },
  { name: "Bòrd na Gàidhlig", region: "Scotland", desc: "Scotland's Gaelic language development body." },
];

export default function CommunityPage() {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen bg-gc-bg">
      <section className="bg-gradient-to-br from-gc-dark to-gc-mid text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-tarheel text-xs font-display tracking-widest uppercase mb-2">GlobalCeilidh.com</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 tracking-wide">
            {language === 'gd' ? 'Coimhearsnachd' : 'Community'}
          </h1>
          <p className="text-white/70 font-body text-lg max-w-2xl">
            {language === 'gd'
              ? 'Gach buidheann Ghàidhlig — aon dachaigh. Post aon uair, ruig gach àrd-ùrlar.'
              : 'Every Gaelic organisation — one home. Post once, reach every platform.'}
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {organisations.map((org, i) => (
              <div key={i} className="bg-white rounded-xl border border-gc-border hover:border-tarheel hover:shadow-md transition-all p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs bg-tarheel-pale text-tarheel-dark px-2 py-1 rounded-full font-medium">{org.region}</span>
                </div>
                <h3 className="font-display text-gc-dark font-semibold mb-2">{org.name}</h3>
                <p className="text-gc-muted text-sm font-body leading-relaxed">{org.desc}</p>
              </div>
            ))}
            {/* Add your organisation card */}
            <div className="bg-tarheel-pale rounded-xl border-2 border-dashed border-tarheel/40 hover:border-tarheel p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer">
              <span className="text-3xl mb-3">+</span>
              <h3 className="font-display text-tarheel-dark font-semibold mb-2">
                {language === 'gd' ? 'Cuir d\' bhuidheann ris' : 'Add Your Organisation'}
              </h3>
              <p className="text-gc-muted text-sm font-body">
                {language === 'gd'
                  ? 'Post aon uair — ruig gach àrd-ùrlar Gàidhlig air feadh an t-saoghail.'
                  : 'Post once — reach every Gaelic platform worldwide. Free forever.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
