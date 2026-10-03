import React, { useState } from 'react';
import { X, Save, Sparkles, Link as LinkIcon } from 'lucide-react';
import { NewsItem, NewsCategory } from '../data/news';

interface NewsModalProps {
  item: NewsItem | null;
  onSave: (savedItem: NewsItem) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { id: NewsCategory; label: string; icon: string; badgeCls: string }[] = [
  { id: 'publication', label: 'Recent Publication', icon: '🎓', badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'achievement', label: 'Achievement / Award', icon: '🏆', badgeCls: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'field', label: 'Field Campaign', icon: '🚁', badgeCls: 'bg-sky-50 text-sky-800 border-sky-200' },
  { id: 'blog', label: 'Blog / Research Note', icon: '✍️', badgeCls: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'general', label: 'Lab Announcement', icon: '📢', badgeCls: 'bg-slate-50 text-slate-800 border-slate-200' },
];

export const NewsModal: React.FC<NewsModalProps> = ({ item, onSave, onClose }) => {
  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState<NewsCategory>(item?.category || 'publication');
  const [date, setDate] = useState(item?.date || new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(item?.summary || '');
  const [link, setLink] = useState(item?.link || '');
  const [error, setError] = useState('');

  const applyTemplate = (cat: NewsCategory) => {
    setCategory(cat);
    if (cat === 'publication') {
      setTitle('New Research Paper Published: [Paper Title Here]');
      setSummary('Our team has published a new peer-reviewed paper in [Journal Name] detailing [brief summary of findings, models, or datasets].');
      setLink('#publications');
    } else if (cat === 'achievement') {
      setTitle('ERSL Researcher Awarded [Grant / Fellowship / Recognition]');
      setSummary('Congratulations to [Researcher Name] for receiving [Award / Honor] for exceptional research contributions in remote sensing and hydrology.');
      setLink('#people');
    } else if (cat === 'field') {
      setTitle('Completed Field Survey: [Location / River Reach]');
      setSummary('The lab completed UAV LiDAR scanning and in-situ hydrologic water quality sampling in [Location], synchronized with satellite overpasses.');
      setLink('#field');
    } else if (cat === 'blog') {
      setTitle('Lab Research Note: [Topic or Method Overview]');
      setSummary('A quick look inside our latest modeling workflows: how we apply GeoAI and satellite altimetry to solve continental water challenges.');
      setLink('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a news headline / title.');
      return;
    }
    if (!summary.trim()) {
      setError('Please provide a summary or description for the news story.');
      return;
    }

    const savedItem: NewsItem = {
      id: item?.id || 'news-' + Date.now(),
      title: title.trim(),
      category,
      date: date || new Date().toISOString().split('T')[0],
      summary: summary.trim(),
      link: link.trim() || undefined,
    };

    onSave(savedItem);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-left">
        {/* Header */}
        <div className="bg-[#9E1B32] p-5 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">📰</span>
              <h3 className="font-extrabold text-base tracking-tight">
                {item ? 'Edit News & Announcements' : 'Post News, Publication, or Achievement'}
              </h3>
            </div>
            <p className="text-[11px] text-red-100 mt-0.5">
              Updates will be published immediately on the public ERSL homepage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Quick starter templates */}
          {!item && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#9E1B32]" /> Quick 1-Click Templates:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTemplate('publication')}
                  className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg transition-colors font-semibold"
                >
                  🎓 New Paper
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('achievement')}
                  className="text-[11px] bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-300 px-2.5 py-1 rounded-lg transition-colors font-semibold"
                >
                  🏆 Award / Grant
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('field')}
                  className="text-[11px] bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 px-2.5 py-1 rounded-lg transition-colors font-semibold"
                >
                  🚁 Field Campaign
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('blog')}
                  className="text-[11px] bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 px-2.5 py-1 rounded-lg transition-colors font-semibold"
                >
                  ✍️ Blog / Story
                </button>
              </div>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Category / Story Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCategory(opt.id)}
                  className={`text-xs p-2 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                    category === opt.id
                      ? 'border-[#9E1B32] bg-red-50/40 text-[#9E1B32] font-bold shadow-xs ring-1 ring-[#9E1B32]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-sm">{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Headline / Title */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Headline / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. New Paper Accepted in Remote Sensing of Environment"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/30 focus:border-[#9E1B32]"
              required
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Publish Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/30 focus:border-[#9E1B32]"
              />
            </div>
          </div>

          {/* Story Summary / Content */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Summary / Story Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Describe the research milestone, blog overview, publication findings, or field campaign achievements..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/30 focus:border-[#9E1B32] leading-relaxed"
              required
            />
          </div>

          {/* Optional Link URL */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Target Link (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="e.g. https://doi.org/... or #publications or #field"
                className="w-full text-xs p-2.5 pl-8 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/30 focus:border-[#9E1B32]"
              />
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Tip: Enter an external URL (https://...), a DOI link, or an internal tab like <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">#publications</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">#field</code>.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#9E1B32] hover:bg-red-800 rounded-lg transition-all shadow-sm cursor-pointer flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{item ? 'Save Changes' : 'Publish Story'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
