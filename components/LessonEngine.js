'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

const REWARDS = [
  { at: 3,  icon: '☕', t: 'Cofaidh Beag!',    g: 'Còcaireachd mhath!' },
  { at: 6,  icon: '☕', t: 'Cofaidh Mòr!',     g: 'Glè mhath!' },
  { at: 9,  icon: '🫐', t: 'Sgona!',           g: 'Iongantach!' },
  { at: 11, icon: '🍲', t: 'Brot an Latha!',   g: 'Sgoinneil!' },
  { at: 13, icon: '🥪', t: 'Ceapaire!',        g: 'Bravo!' },
  { at: 15, icon: '🎂', t: 'Cèic Mhilis!',     g: 'Air leth math!' },
];

function clean(s) {
  return s.toLowerCase()
    .replace(/[àáâ]/g, 'a').replace(/[èéê]/g, 'e')
    .replace(/[ìíî]/g, 'i').replace(/[òóô]/g, 'o').replace(/[ùúû]/g, 'u')
    .replace(/\(formal\)|\(informal\)/gi, '').replace(/^and\s+/i, '')
    .replace(/[^a-z0-9\s']/g, '').replace(/\s+/g, ' ').trim();
}

export default function LessonEngine({ level }) {
  const { language } = useLanguage();
  const [tab, setTab] = useState('learn');
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [learned, setLearned] = useState(new Set());
  const [exList, setExList] = useState([]);
  const [exIdx, setExIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [reward, setReward] = useState(null);
  const [shownRewards, setShownRewards] = useState(new Set());
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map level prop to database level value
  const dbLevel = level === 'beginner' ? 'toiseachadh'
    : level === 'intermediate' ? 'meadhanach'
    : level === 'advanced' ? 'adhartach'
    : 'toiseachadh';

  // Fetch lesson items from Supabase
  useEffect(() => {
    async function fetchLessonItems() {
      setLoading(true);
      setError(null);

      try {
        // Get the cafaidh immersion location
        const { data: location, error: locError } = await supabase
          .from('immersion_locations')
          .select('id')
          .eq('slug', 'cafaidh')
          .single();

        if (locError) throw locError;

        // Get Unit 1 for this location and level
        const { data: unit, error: unitError } = await supabase
          .from('units')
          .select('id')
          .eq('immersion_location_id', location.id)
          .eq('level', dbLevel)
          .eq('unit_number', 1)
          .single();

        if (unitError) throw unitError;

        // Get all lesson items for this unit
        const { data: items, error: itemsError } = await supabase
          .from('lesson_items')
          .select('*')
          .eq('unit_id', unit.id)
          .eq('item_type', 'phrase')
          .order('sort_order');

        if (itemsError) throw itemsError;

        // Transform to phrase format
        const transformed = items.map(item => ({
          g: item.gaelic,
          e: item.english,
          ph: item.phonetic || '',
          ck: [item.english.toLowerCase(), item.gaelic?.toLowerCase()].filter(Boolean),
        }));

        setPhrases(transformed);

        // Build exercise list
        const exercises = [];
        transformed.forEach((p, i) => {
          exercises.push({ type: 'to-english', p, i });
          exercises.push({ type: 'to-gaelic', p, i });
        });
        setExList(exercises.sort(() => Math.random() - 0.5));

      } catch (err) {
        console.error('Failed to load lesson:', err);
        setError('Cha deach an leasan a luchdadh. The lesson could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    fetchLessonItems();
  }, [level, dbLevel]);

  const progress = phrases.length > 0
    ? Math.round((learned.size / phrases.length) * 100)
    : 0;

  const checkAnswer = () => {
    if (answered || !answer.trim()) return;
    setAnswered(true);
    const ex = exList[exIdx];
    const p = ex.p;
    const ca = clean(answer);
    let ok = false, close = false;

    if (ex.type === 'to-english') {
      ok = p.ck.some(acc => clean(acc) === ca);
      if (!ok) {
        const keys = clean(p.e).split(' ').filter(w => w.length > 3 && !['formal', 'informal', 'please'].includes(w));
        const hits = keys.filter(k => ca.includes(k));
        ok = keys.length > 0 && hits.length >= Math.ceil(keys.length * 0.7);
        close = !ok && hits.length >= 1;
      }
    } else {
      ok = p.ck.some(acc => clean(acc) === ca);
      if (!ok) {
        const words = clean(p.g).split(' ');
        const awords = ca.split(' ');
        const m = words.filter(w => w.length > 2 && awords.includes(w));
        ok = m.length >= Math.ceil(words.length * 0.7);
        close = !ok && m.length >= Math.ceil(words.length * 0.5);
      }
    }

    const pts = level === 'advanced' ? 30 : level === 'intermediate' ? 20 : 10;

    if (ok) {
      setScore(s => s + pts);
      setCorrect(c => {
        const newC = c + 1;
        const rwd = REWARDS.find(r => r.at === newC && !shownRewards.has(r.at));
        if (rwd) {
          setShownRewards(prev => new Set([...prev, rwd.at]));
          setReward(rwd);
          setTimeout(() => setReward(null), 4000);
        }
        return newC;
      });
      setLearned(prev => new Set([...prev, ex.i]));
      setFeedback({ type: 'correct', msg: `Ceart! — "${ex.type === 'to-english' ? p.e : p.g}"`, ph: p.ph });
    } else if (close) {
      setScore(s => s + Math.round(pts * 0.4));
      setFeedback({ type: 'close', msg: `Almost! The answer is: "${ex.type === 'to-english' ? p.e : p.g}"`, ph: p.ph });
    } else {
      setFeedback({ type: 'wrong', msg: `Not quite. The answer is: "${ex.type === 'to-english' ? p.e : p.g}"`, ph: p.ph });
    }
  };

  const nextEx = () => {
    setExIdx(i => i + 1);
    setAnswer('');
    setFeedback(null);
    setAnswered(false);
  };

  const currentEx = exList[exIdx];

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gc-border shadow-sm p-8 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 rounded-full bg-tarheel/20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-xl font-display text-tarheel font-bold">A</span>
          </div>
          <p className="text-gc-muted text-sm">
            {language === 'gd' ? 'A\' luchdadh an leasan...' : 'Loading lesson...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gc-border shadow-sm overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-gc-dark to-gc-mid p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-tarheel/30 flex items-center justify-center">
              <span className="text-sm font-display font-bold">A</span>
            </div>
            <div>
              <p className="text-xs font-display tracking-widest uppercase text-tarheel">Aileen</p>
              <p className="text-xs text-white/60">An Cafaidh Balla Cloiche</p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div><div className="text-lg font-display font-bold">{score}</div><div className="text-xs text-white/50">Points</div></div>
            <div><div className="text-lg font-display font-bold">{correct}</div><div className="text-xs text-white/50">Correct</div></div>
            <div><div className="text-lg font-display font-bold">{learned.size}</div><div className="text-xs text-white/50">Learned</div></div>
          </div>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-tarheel rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-white/50 mt-1">{progress}% {language === 'gd' ? 'air ionnsachadh' : 'learned'}</p>
      </div>

      {/* Reward banner */}
      {reward && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">{reward.icon}</span>
          <div>
            <p className="text-green-800 font-medium text-sm">{reward.t}</p>
            <p className="text-green-600 text-xs">{reward.g}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gc-border">
        {[
          { id: 'learn',    en: 'Learn',     gd: 'Ionnsaich' },
          { id: 'practice', en: 'Practice',  gd: 'Cleachd' },
          { id: 'challenge',en: 'Challenge', gd: 'Dùbhlan' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'text-tarheel-dark border-b-2 border-tarheel'
                : 'text-gc-muted hover:text-gc-text'
            }`}>
            {language === 'gd' ? t.gd : t.en}
          </button>
        ))}
      </div>

      <div className="p-4">

        {/* Learn Tab */}
        {tab === 'learn' && (
          <div>
            <div className="bg-tarheel-pale rounded-xl p-4 mb-4 border border-tarheel/20">
              <p className="text-xs font-display tracking-widest uppercase text-tarheel-dark mb-3">
                {language === 'gd' ? 'Ionnsaich mar aon aonad' : 'Learn as one complete unit'}
              </p>
              {[
                { speaker: language === 'gd' ? 'Thusa' : 'You', g: 'Madainn mhath! Ciamar a tha sibh an-diugh?', e: 'Good morning! How are you today?' },
                { speaker: 'Ceitidh', g: 'Tha mi gu math, tapadh leibh. Ciamar a tha sibh fhèin?', e: 'I am well, thank you. How are you yourself?' },
                { speaker: language === 'gd' ? 'Thusa' : 'You', g: 'Tha mi gu math, tapadh leibh.', e: 'I am well, thank you.' },
              ].map((line, i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-tarheel/10 last:border-0">
                  <span className="text-xs font-medium text-tarheel min-w-16 pt-0.5">{line.speaker}</span>
                  <div>
                    <p className="text-sm font-medium text-gc-dark">{line.g}</p>
                    {level !== 'advanced' && <p className="text-xs text-gc-muted mt-0.5">{line.e}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {phrases.map((p, i) => (
                <button key={i}
                  onClick={() => setLearned(prev => new Set([...prev, i]))}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    learned.has(i)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gc-border hover:border-tarheel bg-white'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${learned.has(i) ? 'text-green-800' : 'text-gc-dark'}`}>{p.g}</p>
                      {level !== 'advanced' && (
                        <p className={`text-xs mt-0.5 ${learned.has(i) ? 'text-green-600' : 'text-gc-muted'} ${level === 'intermediate' ? 'blur-sm hover:blur-none transition-all' : ''}`}>
                          {p.e}
                        </p>
                      )}
                      {p.ph && level === 'beginner' && (
                        <p className="text-xs text-cobalt mt-0.5 italic">{p.ph}</p>
                      )}
                    </div>
                    {learned.has(i) && <span className="text-green-500 text-sm ml-2">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Practice Tab */}
        {tab === 'practice' && (
          <div>
            {!currentEx || exIdx >= exList.length ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-display text-gc-dark font-semibold mb-1">
                  {language === 'gd' ? 'Glè mhath!' : 'Well done!'}
                </p>
                <p className="text-gc-muted text-sm mb-4">
                  {language === 'gd' ? `Sgòr deireannach: ${score}` : `Final score: ${score} points`}
                </p>
                <button onClick={() => { setExIdx(0); setScore(0); setCorrect(0); setLearned(new Set()); setShownRewards(new Set()); }}
                  className="px-6 py-2.5 bg-tarheel text-white rounded-lg text-sm font-medium hover:bg-tarheel-dark transition-colors">
                  {language === 'gd' ? 'Tòisich a-rithist' : 'Start Again'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs text-gc-muted mb-4">
                  <span>{currentEx.type === 'to-english'
                    ? (language === 'gd' ? 'Ciall sa Bheurla?' : 'What does this mean in English?')
                    : (language === 'gd' ? 'Ciamar a chanas tu sa Ghàidhlig?' : 'How do you say this in Gàidhlig?')}
                  </span>
                  <span>{exIdx + 1} / {exList.length}</span>
                </div>
                <p className="text-xl font-medium text-cobalt mb-4 font-body">
                  {currentEx.type === 'to-english' ? currentEx.p.g : currentEx.p.e}
                </p>
                <input
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                  disabled={answered}
                  placeholder={language === 'gd' ? 'Sgrìobh do fhreagairt...' : 'Type your answer...'}
                  className="w-full px-4 py-3 border border-gc-border rounded-lg text-sm focus:outline-none focus:border-tarheel transition-colors mb-3"
                />
                {feedback && (
                  <div className={`p-3 rounded-lg mb-3 text-sm ${
                    feedback.type === 'correct' ? 'bg-green-50 text-green-800 border border-green-200' :
                    feedback.type === 'close' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <p>{feedback.msg}</p>
                    <p className="text-xs mt-1 opacity-75">{language === 'gd' ? 'Fuaimneachadh:' : 'Pronunciation:'} {feedback.ph}</p>
                  </div>
                )}
                {!answered ? (
                  <button onClick={checkAnswer}
                    className="w-full py-3 bg-tarheel text-white rounded-lg text-sm font-medium hover:bg-tarheel-dark transition-colors">
                    {language === 'gd' ? 'Thoir seachad' : 'Submit'}
                  </button>
                ) : (
                  <button onClick={nextEx}
                    className="w-full py-3 border border-tarheel text-tarheel-dark rounded-lg text-sm font-medium hover:bg-tarheel-pale transition-colors">
                    {language === 'gd' ? 'Adhart →' : 'Next →'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Challenge Tab */}
        {tab === 'challenge' && (
          <div className="text-center py-8">
            <p className="text-3xl mb-3">🏴󠁧󠁢󠁳󠁣󠁴󠁿</p>
            <p className="font-display text-gc-dark font-semibold mb-2">
              {language === 'gd' ? 'An Dùbhlan' : 'The Challenge'}
            </p>
            <p className="text-gc-muted text-sm mb-4">
              {correct >= 6
                ? (language === 'gd' ? 'Tha an dùbhlan deiseil dhut!' : 'The challenge is ready for you!')
                : (language === 'gd'
                  ? `Feumaidh tu ${6 - correct} ceist eile a chur às dèidh a chèile`
                  : `Complete ${6 - correct} more exercises to unlock`)}
            </p>
            {correct >= 6 && (
              <button onClick={() => setTab('practice')}
                className="px-6 py-3 bg-cobalt text-white rounded-lg text-sm font-medium hover:bg-cobalt-dark transition-colors">
                {language === 'gd' ? 'Tòisich an Dùbhlan' : 'Start Challenge'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}