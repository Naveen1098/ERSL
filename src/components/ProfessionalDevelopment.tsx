import React, { useState } from 'react';
import { Calendar, GraduationCap, Award, BookOpen, ExternalLink, Sparkles, CheckCircle2, ChevronRight, Compass } from 'lucide-react';

interface ResourceItem {
  id: string;
  category: 'guidance' | 'conference' | 'fellowship' | 'training' | 'career';
  title: string;
  organization: string;
  deadlineOrDate?: string;
  description: string;
  tags: string[];
  link?: string;
}

const resources: ResourceItem[] = [
  {
    id: 'g-1',
    category: 'guidance',
    title: 'How to Write & Structure a High-Impact Remote Sensing Paper (RSE, WRR, IEEE TGRS)',
    organization: 'ERSL Academic Writing Series',
    deadlineOrDate: 'Essential Lab Guide',
    description: 'Comprehensive guidelines for structuring high-impact manuscripts: framing Q1 titles & abstracts, designing high-resolution GeoAI pipeline figures, reporting validation metrics (RMSE, R², IoU), and writing balanced discussion sections.',
    tags: ['Paper Writing', 'Methodology Figures', 'Journal Selection', 'Q1 Publication'],
    link: 'https://www.journals.elsevier.com/remote-sensing-of-environment',
  },
  {
    id: 'g-2',
    category: 'guidance',
    title: 'Constructive Responses to Peer Reviewers & Revision Strategies',
    organization: 'ERSL Publication Mentorship',
    deadlineOrDate: 'Peer Review Toolkit',
    description: 'Templates and strategies for responding line-by-line to reviewer comments, writing polite point-by-point response letters, and handling major/minor revisions.',
    tags: ['Peer Review', 'Revisions', 'Author Response'],
  },
  {
    id: 'g-3',
    category: 'guidance',
    title: 'Grant & Fellowship Proposal Writing (NASA FINESST & NSF GRFP)',
    organization: 'ERSL Proposal Workshop',
    deadlineOrDate: 'Proposal Season Guide',
    description: 'Framework for writing winning research proposals: defining Intellectual Merit, Broader Impacts, project scope, budget justification, and realistic research timelines.',
    tags: ['NASA FINESST', 'NSF GRFP', 'Grant Writing', 'Proposal Structure'],
    link: 'https://science.nasa.gov/researchers/smd-funding-opportunities',
  },
  {
    id: 'g-4',
    category: 'guidance',
    title: 'Reproducible Code & Geospatial Data Archiving Guidelines (FAIR Principles)',
    organization: 'ERSL Open Science Standard',
    deadlineOrDate: 'Lab Data Management',
    description: 'Best practices for structuring Python/R codebases on GitHub, creating clean Conda environments, documenting READMEs, and obtaining Zenodo DOIs for code & datasets.',
    tags: ['FAIR Data', 'GitHub', 'Zenodo DOI', 'Open Science'],
  },
  {
    id: 'p-1',
    category: 'conference',
    title: 'AGU Fall Meeting 2026 (American Geophysical Union)',
    organization: 'AGU Earth & Space Science',
    deadlineOrDate: 'Abstract Deadline: Aug 2026 | Conference: Dec 2026',
    description: 'Premier international gathering for hydrology, remote sensing, and satellite earth observation researchers.',
    tags: ['Hydrology', 'Remote Sensing', 'GIS', 'Satellite Altimetry'],
    link: 'https://www.agu.org/fall-meeting',
  },
  {
    id: 'p-2',
    category: 'conference',
    title: 'IEEE International Geoscience and Remote Sensing Symposium (IGARSS)',
    organization: 'IEEE GRSS',
    deadlineOrDate: 'Submission Deadline: Jan 2026 | Event: July 2026',
    description: 'Leading global conference on SAR remote sensing, optical water quality algorithms, and deep learning for Earth Observation.',
    tags: ['SAR', 'GeoAI', 'Deep Learning', 'IEEE'],
    link: 'https://www.grss-ieee.org/events/igarss/',
  },
  {
    id: 'p-3',
    category: 'fellowship',
    title: 'NASA Future Investigators in NASA Earth and Space Science and Technology (FINESST)',
    organization: 'NASA Earth Science Division',
    deadlineOrDate: 'Proposal Deadline: Feb 2026',
    description: 'Provides research grants for PhD students conducting research in satellite hydrology, water quality, and remote sensing.',
    tags: ['NASA Grant', 'PhD Fellowship', 'Earth Observation'],
    link: 'https://science.nasa.gov/researchers/smd-funding-opportunities',
  },
  {
    id: 'p-4',
    category: 'fellowship',
    title: 'NSF Graduate Research Fellowship Program (GRFP)',
    organization: 'National Science Foundation',
    deadlineOrDate: 'Deadline: October 2026',
    description: 'Three-year graduate fellowship support for outstanding STEM PhD candidates in Geosciences and Computational AI.',
    tags: ['NSF', 'Stipend', 'Graduate Support'],
    link: 'https://www.nsfgrfp.org/',
  },
  {
    id: 'p-5',
    category: 'training',
    title: 'NASA ARSET Training: Applied Remote Sensing for Coastal & Inland Water Quality',
    organization: 'NASA ARSET Program',
    deadlineOrDate: 'Self-Paced Workshops & Live Sessions',
    description: 'Hands-on online tutorials for processing Landsat-8/9, Sentinel-2, and Sentinel-3 OLCI water color imagery.',
    tags: ['Water Quality', 'Sentinel-3', 'Turbidity', 'NASA ARSET'],
    link: 'https://appliedsciences.nasa.gov/what-we-do/capacity-building/arset',
  },
  {
    id: 'p-6',
    category: 'training',
    title: 'GeoAI & Deep Learning for Earth Observation (PyTorch & Earth Engine)',
    organization: 'ERSL Internal Skill Track',
    deadlineOrDate: 'Continuous Open Access',
    description: 'Curated notebooks for river reach extraction, U-Net flood extent segmentation, and SAR super-resolution models.',
    tags: ['Python', 'PyTorch', 'Google Earth Engine', 'GeoAI'],
    link: 'https://earthengine.google.com/',
  },
  {
    id: 'p-7',
    category: 'career',
    title: 'NOAA Center for Inland Bays & CIROH Research Fellowships',
    organization: 'CIROH / NOAA',
    deadlineOrDate: 'Annual Intake',
    description: 'Postdoctoral and researcher career opportunities in continental hydrological forecasting, hydro-informatics, and flood risk mitigation.',
    tags: ['CIROH', 'NOAA', 'Career', 'Postdoc'],
    link: 'https://ciroh.ua.edu/',
  },
];

export const ProfessionalDevelopment: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'guidance' | 'conference' | 'fellowship' | 'training' | 'career'>('guidance');

  const filtered = resources.filter(r => filter === 'all' || r.category === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left select-none">
      {/* Header Banner */}
      <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md">
        <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">CAREER & ACADEMIC GROWTH</span>
        <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Professional Development & Writing Guidance</h2>
        <p className="text-xs md:text-sm text-red-100 mt-1 max-w-2xl">
          Paper writing guidelines, reviewer response toolkits, NASA/NSF fellowship proposals, AGU/IGARSS conference deadlines, and GeoAI workshops.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {[
          { key: 'guidance', label: '📚 Academic & Paper Writing Guidance' },
          { key: 'all', label: 'All Opportunities' },
          { key: 'conference', label: '📢 Conferences & Symposia' },
          { key: 'fellowship', label: '🎓 Grants & Fellowships' },
          { key: 'training', label: '💻 Workshops & Skill Tracks' },
          { key: 'career', label: '🚀 Career Pathways' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === tab.key
                ? 'bg-[#9E1B32] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#9E1B32] hover:text-[#9E1B32]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-50 text-[#9E1B32] border border-red-100">
                  {r.category === 'guidance' ? 'Writing & Research Guide' : r.category === 'conference' ? 'Conference' : r.category === 'fellowship' ? 'Fellowship / Grant' : r.category === 'training' ? 'Technical Workshop' : 'Career Opportunity'}
                </span>
                {r.deadlineOrDate && (
                  <span className="text-[10px] font-bold text-gray-500 bg-slate-50 px-2 py-0.5 rounded border border-gray-200">
                    {r.deadlineOrDate}
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#9E1B32] transition-colors">{r.title}</h3>
              <p className="text-xs font-semibold text-gray-500 mt-1">{r.organization}</p>
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">{r.description}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {r.tags.map(t => (
                  <span key={t} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    #{t}
                  </span>
                ))}
              </div>

              {r.link && (
                <a
                  href={r.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#9E1B32] hover:text-red-800 flex items-center gap-1 hover:underline"
                >
                  <span>Learn more</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
