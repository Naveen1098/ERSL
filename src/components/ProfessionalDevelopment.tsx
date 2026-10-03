import React, { useState, useMemo, useRef } from 'react';
import { 
  BookOpen, FileText, Download, ExternalLink, Sparkles, CheckCircle2, 
  ChevronRight, Compass, Search, Tag, Clock, User, X, Plus, FolderGit2, 
  Paperclip, FileSpreadsheet, FileCode, Archive, Share2, Bookmark, Check,
  Lightbulb, Layers, Award
} from 'lucide-react';
import type { User as UserType } from '../types';

export interface GuideAttachment {
  name: string;
  type: 'pdf' | 'docx' | 'tex' | 'py' | 'xlsx' | 'box' | 'zip' | 'other';
  size: string;
  description: string;
  url?: string;
}

export interface MentorshipPost {
  id: string;
  category: 'guidance' | 'peer_review' | 'grants' | 'open_science' | 'conferences' | 'careers';
  categoryLabel: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  lead: string;
  sections: {
    heading: string;
    body: string;
    keyTips?: string[];
    codeSnippet?: { language: string; code: string };
  }[];
  attachments: GuideAttachment[];
  tags: string[];
}

const initialPosts: MentorshipPost[] = [
  {
    id: 'post-1',
    category: 'guidance',
    categoryLabel: 'Manuscript Masterclass',
    title: 'How to Write & Structure a High-Impact Remote Sensing Paper (RSE, WRR, IEEE TGRS)',
    author: 'Dr. Hongxing Liu & ERSL Mentorship Committee',
    date: 'Updated Fall 2026',
    readTime: '8 min read',
    lead: 'A step-by-step masterclass on structuring manuscripts that satisfy demanding peer reviewers in top-quartile journals (Remote Sensing of Environment, Water Resources Research, and IEEE Transactions on Geoscience & Remote Sensing).',
    sections: [
      {
        heading: '1. The Anatomy of a Winning Title & Abstract Formula',
        body: 'A compelling remote sensing paper title must clearly answer three questions: (1) What is the environmental process? (2) What is the observation technology or algorithm? (3) What is the geographic or hydrologic domain? Avoid vague titles like "Study of Flood Extent in Alabama." Instead, use active formulation: "High-Resolution Flood Inundation Depth Retrieval by Integrating Spaceborne SWOT Altimetry and Physics-Informed Neural Networks in Lowland River Basins."\n\nYour 200-word abstract must strictly adhere to the 5-sentence rule: Context -> Critical Research Gap -> Novel Methodological Contribution -> Quantified Experimental Results (always report RMSE, R², or IoU) -> Broader Hydrological Implication.',
        keyTips: [
          'Never submit an abstract without quantified metric improvements over state-of-the-art baselines.',
          'Identify your target journal before drafting your introduction so your scope matches the journal aims.'
        ]
      },
      {
        heading: '2. Designing Figure 1: The End-to-End Methodology Architecture',
        body: 'Reviewers look at Figure 1 before reading a single paragraph of your methodology. Your overview schematic must illustrate: (1) Satellite data inputs & resolution (e.g. SWOT, Sentinel-1 SAR, Landsat-8/9), (2) In-situ ground truth calibration sources (USGS stream gauges, ADCP acoustic surveys), (3) Preprocessing and feature engineering, (4) Model architecture or hydrologic physical equations, and (5) Deliverable validation metrics. Figure 1 should be vector-based (SVG/PDF), exported at 300+ DPI, using clean, color-blind friendly palettes.',
        keyTips: [
          'Use consistent typography (Inter or Helvetica) across all figures in your manuscript.',
          'Include high-contrast spatial bounding boxes showing your regional study basin.'
        ]
      },
      {
        heading: '3. Section-by-Section Manuscript Structure & Best Practices',
        body: 'Introduction: Lead with the continental or global water management challenge, synthesize the limitations of existing satellite sensors or hydrodynamic models, and conclude with three explicit enumerated research objectives.\n\nMethods: Detail data collection, spatial resolution, cloud-masking filters, and algorithmic math equations with fully defined parameters.\n\nResults: Present findings hierarchically from overall statistical accuracy to localized extreme hydrological events (e.g. 100-year flood crests).\n\nDiscussion: Honestly acknowledge residual satellite swath revisit limitations, sensor noise, and future transferability to ungauged watersheds.',
        keyTips: [
          'Keep your discussion separate from results to avoid confusing observations with speculative interpretation.',
          'Explicitly contrast your performance curves against recent published benchmark models.'
        ]
      }
    ],
    attachments: [
      {
        name: 'ERSL_Standard_Manuscript_Template_LaTeX.zip',
        type: 'tex',
        size: '1.8 MB',
        description: 'Complete Overleaf / LaTeX template configured for IEEE TGRS, Elsevier RSE, and AGU journals with ERSL bibtex styles.'
      },
      {
        name: 'ERSL_Journal_Manuscript_Structure_Guide.pdf',
        type: 'pdf',
        size: '2.4 MB',
        description: 'Annotated 12-page guide with side-by-side examples of accepted vs. rejected introduction frameworks and figure designs.'
      },
      {
        name: 'Journal_Targeting_Matrix_RemoteSensing_Water.xlsx',
        type: 'xlsx',
        size: '240 KB',
        description: 'Comparison matrix of 25 top remote sensing & hydrology journals with current Impact Factors, review speeds, and open access costs.'
      },
      {
        name: 'UA Box: High-Res Vector Figure Templates & GIS Color Schemes',
        type: 'box',
        size: 'Cloud Workspace',
        description: 'Direct link to UA Box folder containing Adobe Illustrator / Draw.io flowchart templates and scientific color palettes.',
        url: 'https://ua.box.com'
      }
    ],
    tags: ['Paper Writing', 'Methodology Figures', 'Journal Selection', 'LaTeX Template', 'Q1 Publication']
  },
  {
    id: 'post-2',
    category: 'peer_review',
    categoryLabel: 'Reviewer Rebuttal Toolkit',
    title: 'Constructive Responses to Peer Reviewers: Turning Major Revisions into Rapid Acceptances',
    author: 'Dr. Hongxing Liu',
    date: 'Updated Fall 2026',
    readTime: '6 min read',
    lead: 'Proven templates, psychological frameworks, and line-by-line response formulas for answering harsh, skeptical, or contradictory peer review comments respectfully and convincingly.',
    sections: [
      {
        heading: '1. The Mindset of an Author Response',
        body: 'Receiving a "Major Revision" decision with 30 skeptical comments from Reviewer 2 is standard academic reality—not a rejection. The single most important rule is: Never reply in haste. Give yourself 48 hours to digest the critique.\n\nRemember: The editor wants to accept your paper, provided you make it easy for them to verify that the reviewers concerns have been thoroughly resolved. Treat the reviewers as rigorous peer colleagues who invested several unpaid hours examining your work.',
        keyTips: [
          'Never argue defensively. Even when a reviewer misunderstood a point, conclude: "We appreciate the reviewers question and realize our original explanation was insufficiently clear. We have rephrased this section on Page 7, Lines 142-155."'
        ]
      },
      {
        heading: '2. The 3-Part Point-by-Point Rebuttal Formula',
        body: 'Every single reviewer comment must be answered using an unvarying 3-part layout:\n\n1. Comment Quote: Paste the reviewers exact words in bold italic text.\n2. Author Response: Begin with polite acknowledgment ("We agree with the reviewer that cloud contamination could introduce bias..."). Then provide your direct scientific reasoning and any new experimental sensitivity runs performed.\n3. Manuscript Modification Excerpt: Paste the exact revised sentences added to the manuscript, explicitly citing the Revised Manuscript Page Number and Line Numbers.',
        keyTips: [
          'Use colored text boxes or quotation blocks for revised manuscript excerpts so the editor can scan them in minutes.',
          'Provide a tracked-changes version of the manuscript alongside a clean final PDF.'
        ]
      },
      {
        heading: '3. Handling Impossible or Contradictory Reviewer Demands',
        body: 'What if Reviewer 1 requests expanding field surveys across all North American rivers, while Reviewer 2 demands shortening the manuscript? Do not ignore the request. Instead, explain the scope constraints politely, add a thoughtful subsection in your Discussion section addressing the theoretical implications, and provide supplementary sensitivity tests in your response letter.',
        keyTips: [
          'When reviewers disagree with each other, gently highlight the divergent perspectives and outline how your balanced compromise respects both viewpoints.'
        ]
      }
    ],
    attachments: [
      {
        name: 'Point_by_Point_Reviewer_Response_Template.docx',
        type: 'docx',
        size: '145 KB',
        description: 'Formatted Word template with pre-styled Comment / Response / Excerpt blocks, standard polite academic phrasing, and editor cover letters.'
      },
      {
        name: 'Annotated_Reviewer_Response_Accepted_TGRS.pdf',
        type: 'pdf',
        size: '1.2 MB',
        description: 'De-identified real exemplar response letter that successfully resolved 3 reviewers major revisions in IEEE TGRS.'
      },
      {
        name: 'UA Box: Reviewer Rebuttal & Cover Letter Archive',
        type: 'box',
        size: 'Cloud Workspace',
        description: 'UA Box archive containing 10+ accepted peer-review response packages across Elsevier, AGU, and IEEE.',
        url: 'https://ua.box.com'
      }
    ],
    tags: ['Peer Review', 'Revisions', 'Author Response', 'Response Letter Template', 'Editor Cover Letter']
  },
  {
    id: 'post-3',
    category: 'grants',
    categoryLabel: 'Grant Proposal Blueprint',
    title: 'NASA FINESST & NSF GRFP: Winning Federal Fellowship Proposals in Earth Observation',
    author: 'ERSL Graduate Fellowship Advisory',
    date: 'Annual Cycle 2026-2027',
    readTime: '7 min read',
    lead: 'A comprehensive blueprint for graduate students and postdocs preparing competitive fellowship proposals for NASA FINESST ($150k over 3 years) and the NSF Graduate Research Fellowship Program (GRFP).',
    sections: [
      {
        heading: '1. NASA FINESST Proposal Architecture (6-Page Narrative)',
        body: 'NASA FINESST (Future Investigators in NASA Earth and Space Science and Technology) evaluates two primary criteria: Scientific Merit (often 60% of the score) and Relevance to NASA Earth Science Division (ESD) strategic goals.\n\nYour 6-page project description must directly cite current NASA satellite missions (SWOT, NISAR, Landsat-8/9, PACE, or Sentinel-6) and map each of your proposed chapters to one specific NASA Earth Science question. Use a clear 3-Hypothesis structure: Hypothesis 1 (Algorithm development), Hypothesis 2 (Regional multi-temporal validation), Hypothesis 3 (Hydrological forecasting integration).',
        keyTips: [
          'Include a compelling Gantt chart showing realistic milestones, drone field campaigns, and publication targets over 36 months.',
          'Emphasize how your computational workflow uses NASA open science resources (NASA Earthdata Cloud, LP DAAC, or Earth Engine).'
        ]
      },
      {
        heading: '2. NSF GRFP: Balancing Intellectual Merit and Broader Impacts',
        body: 'The NSF GRFP awards the person, not just the project. You must submit two 3-page statements: (1) Personal, Relevant Background and Future Goals, and (2) Graduate Research Plan.\n\nIn both essays, use bold subheadings for **Intellectual Merit** and **Broader Impacts**. Broader Impacts must demonstrate active educational outreach—such as training undergraduate students in GIS, participating in Alabama water outreach, or developing open-source Python packages for rural water authorities.',
        keyTips: [
          'Reviewers spend less than 8 minutes on your application. Use bold lead-in phrases and high-contrast infographics.',
          'Have your advisor and lab peers critique your draft at least 6 weeks before the October/February submission deadline.'
        ]
      }
    ],
    attachments: [
      {
        name: 'NASA_FINESST_Project_Narrative_Annotated_Framework.pdf',
        type: 'pdf',
        size: '3.1 MB',
        description: '6-page narrative layout framework with optimal heading proportions, figure placements, and milestone Gantt chart templates.'
      },
      {
        name: 'NSF_GRFP_Research_Statement_Template.docx',
        type: 'docx',
        size: '88 KB',
        description: 'Formatted Word document with certified NSF page margins, font sizes, and mandatory Intellectual Merit/Broader Impacts sections.'
      },
      {
        name: 'Research_Milestone_Gantt_Chart_3Year.xlsx',
        type: 'xlsx',
        size: '120 KB',
        description: 'Configured Excel Gantt chart template with automated progress bars and conference presentation milestones.'
      },
      {
        name: 'UA Box: Successful NASA & NSF Proposal Archive',
        type: 'box',
        size: 'Cloud Workspace',
        description: 'Confidential repository of previously awarded ERSL grant narratives and reviewer review summary sheets.',
        url: 'https://ua.box.com'
      }
    ],
    tags: ['NASA FINESST', 'NSF GRFP', 'Grant Writing', 'Proposal Blueprint', 'PhD Funding']
  },
  {
    id: 'post-4',
    category: 'open_science',
    categoryLabel: 'Open Science Standard',
    title: 'Reproducible Code & Geospatial Data Archiving: GitHub, Conda, and FAIR Standards',
    author: 'ERSL Computational Science Lead',
    date: 'Updated Fall 2026',
    readTime: '5 min read',
    lead: 'Standard Operating Procedures for organizing Python/R codebases on GitHub, creating isolated Conda environments, documenting READMEs, and securing Zenodo DOIs to satisfy modern journal data availability mandates.',
    sections: [
      {
        heading: '1. Standard ERSL Repository Architecture',
        body: 'Every research codebase supporting a published paper must follow our standardized directory structure:\n\n- `configs/` -> YAML/JSON hyperparameter files (never hardcode satellite band indices or threshold numbers in model scripts)\n- `src/` -> Core Python modules (preprocessing, neural network models, loss functions, metrics)\n- `notebooks/` -> Jupyter notebooks for exploratory data analysis and figure reproduction (Fig_02_SWOT_accuracy.ipynb)\n- `environment.yml` -> Pinned cross-platform Conda environment\n- `README.md` -> Step-by-step instructions from raw download to final figure generation.',
        keyTips: [
          'Never commit large geospatial raster files (GeoTIFF, NetCDF, HDF5) to Git. Use `.gitignore` and link to UA Box or Zenodo.',
          'Include a 1-command quickstart so reviewers can test your algorithm on sample test chips in under 60 seconds.'
        ]
      },
      {
        heading: '2. Exporting Clean Conda Environments & Zenodo DOIs',
        body: 'When publishing, generate a clean environment YAML without machine-specific local build hashes using:\n`conda env export --no-builds > environment.yml`\n\nTo make your code citable with a permanent DOI, link your GitHub repository to Zenodo (zenodo.org). Each time you create a formal GitHub Release (e.g. `v1.0.0-paper-review`), Zenodo automatically archives a snapshot and issues a DOI that you cite directly in your manuscripts Data Availability Statement.',
        keyTips: [
          'Include an explicit Open Source License (MIT or Apache 2.0) in the root of your repository.',
          'Add a badge to your README linking directly to your Zenodo DOI record.'
        ]
      }
    ],
    attachments: [
      {
        name: 'ERSL_Reproducible_Codebase_Template.zip',
        type: 'zip',
        size: '640 KB',
        description: 'Scaffold repository template with pre-configured directory hierarchy, `.gitignore`, MIT license, and sample Jupyter notebook.'
      },
      {
        name: 'environment_geospatial_deeplearning.yml',
        type: 'py',
        size: '12 KB',
        description: 'Clean, tested Conda environment specification including PyTorch, GDAL, Rasterio, Geopandas, Xarray, and Earth Engine API.'
      },
      {
        name: 'Data_Availability_Statement_Templates.pdf',
        type: 'pdf',
        size: '410 KB',
        description: 'Pre-approved compliance statements for AGU, Nature, and IEEE journals citing GitHub, Zenodo, and UA Box.'
      },
      {
        name: 'UA Box: Benchmark GeoAI Training Data Tensors',
        type: 'box',
        size: 'Cloud Workspace',
        description: 'UA Box direct link to preprocessed satellite patches and ground truth ADCP masks.',
        url: 'https://ua.box.com'
      }
    ],
    tags: ['FAIR Data', 'GitHub', 'Zenodo DOI', 'Open Science', 'Conda', 'Python']
  },
  {
    id: 'post-5',
    category: 'conferences',
    categoryLabel: 'Symposia & Presentations',
    title: 'Conference Presentation & Poster Masterclass (AGU Fall Meeting & IEEE IGARSS)',
    author: 'ERSL Presentation Mentorship',
    date: 'Updated Fall 2026',
    readTime: '6 min read',
    lead: 'How to design captivating billboard-style posters, deliver memorable 12-minute conference talks, and network effectively with NASA/NOAA program managers at premier scientific meetings.',
    sections: [
      {
        heading: '1. The Modern Billboard Poster Format (48x36 inches)',
        body: 'Traditional posters filled with tiny 10-point paragraphs are ignored by conference attendees walking through cavernous convention centers. Instead, use the modern Billboard Poster format:\n\n1. Central Hero Column: Display your main finding in a giant, 54-point headline that anyone can read from 15 feet away (e.g., "SWOT Altimetry Reduces River Discharge Uncertainty by 38% in Low-Gradient Basins").\n2. Left Column: Brief context, satellite inputs, and 3-bullet methodology schematic.\n3. Right Column: High-resolution validation figures and a prominent QR code linking to your published preprint or GitHub repository.',
        keyTips: [
          'Design posters at full resolution (48x36 or 54x36 inches) in PowerPoint or Illustrator using UA Crimson (#9E1B32) branding.',
          'Always test-print a single letter-size page to ensure figure text remains legible before ordering high-cost fabric printing.'
        ]
      },
      {
        heading: '2. Delivering a Flawless 12-Minute Oral Presentation',
        body: 'At AGU and IGARSS, oral sessions strictly allocate 12 minutes for presentation and 3 minutes for Q&A. The optimal deck size is exactly 10 to 12 slides. Spend 2 minutes on the problem, 3 minutes on satellite methodology, 5 minutes on core results with high-contrast animated comparisons, and 2 minutes on future implications.\n\nPractice your presentation with a stopwatch at least four times. Arriving at the conclusion slide at minute 11:30 demonstrates professional mastery and leaves plenty of time for prestigious audience questions.',
        keyTips: [
          'Never read text from slides. Use slides purely as visual anchors for satellite imagery and validation plots.',
          'Bring a backup copy of your presentation on a USB thumb drive and save an offline PDF copy on your smartphone.'
        ]
      }
    ],
    attachments: [
      {
        name: 'ERSL_Official_AGU_IGARSS_Poster_Template_48x36.pptx',
        type: 'docx',
        size: '4.2 MB',
        description: 'Widescreen 48x36 inch PowerPoint poster template featuring UA Crimson branding, modern billboard layouts, and QR code placeholders.'
      },
      {
        name: 'Oral_Presentation_Slide_Deck_Template_16x9.pptx',
        type: 'docx',
        size: '5.8 MB',
        description: 'Modern 16:9 widescreen presentation deck with pre-styled title slides, methodology diagrams, and high-impact conclusion layouts.'
      },
      {
        name: 'UA Box: ERSL Official High-Res Logos & Seal Vector Pack',
        type: 'box',
        size: 'Cloud Workspace',
        description: 'Official University of Alabama and ERSL transparent PNGs, SVG vector logos, and color guidelines for scientific presentations.',
        url: 'https://ua.box.com'
      }
    ],
    tags: ['AGU Fall Meeting', 'IEEE IGARSS', 'Poster Template', 'Presentation Deck', 'Scientific Talks']
  },
  {
    id: 'post-6',
    category: 'careers',
    categoryLabel: 'Career Pathways',
    title: 'Academic & National Lab Career Pathways: Faculty Applications, Postdocs, and Industry GeoAI',
    author: 'Dr. Hongxing Liu & Alumni Network',
    date: 'Updated Fall 2026',
    readTime: '7 min read',
    lead: 'Guidance on navigating the transition from PhD to tenure-track faculty appointments, national laboratory researcher roles (USGS, NOAA, ORNL), and industry geospatial AI careers.',
    sections: [
      {
        heading: '1. Preparing the Academic Faculty Application Package',
        body: 'Academic search committees often receive 80-150 applications per open tenure-track Assistant Professor line in Geography, Civil Engineering, or Geosciences. Your package consists of:\n\n1. Cover Letter (1.5-2 pages): Highlight your research trajectory, funding track record, and specific fit with the hiring department.\n2. Research Statement (3-4 pages): Outline your immediate 3-year funding plans (identifying target NSF/NASA programs) and long-term 10-year vision.\n3. Teaching Statement (2 pages): Detail your student-centered pedagogy, experience mentoring undergraduate researchers, and specific courses you can teach.\n4. Academic Curriculum Vitae: Organized with publications chronologically, clearly distinguishing peer-reviewed journal papers, conference proceedings, and active grants.',
        keyTips: [
          'Tailor each application explicitly to the university: identify 2-3 faculty members in the department with whom you could establish cross-disciplinary research collaborations.',
          'Highlight your university teaching evaluations and any evidence of mentoring junior researchers in the lab.'
        ]
      },
      {
        heading: '2. National Laboratory & Federal Agency Opportunities (NOAA, USGS, NASA)',
        body: 'National laboratories and federal water centers (such as the National Water Center on the UA campus, USGS Water Resources Mission Area, and NOAA CIROH) offer high-impact research careers with continental modeling focus and robust computational resources.\n\nApplications are typically posted through USAJOBS or university cooperative institutes. Highlight your experience with large-scale hydrologic models, high-performance computing (HPC) clusters, and collaborative team science.',
        keyTips: [
          'For federal USAJOBS applications, use detailed federal CV formats that explicitly mirror the required qualifications in the job announcement.',
          'Connect with CIROH and NOAA researchers through on-campus seminars and joint working group meetings.'
        ]
      }
    ],
    attachments: [
      {
        name: 'Academic_Curriculum_Vitae_Template_STEM.docx',
        type: 'docx',
        size: '112 KB',
        description: 'Formatted academic CV template customized for faculty and postdoctoral search committees in remote sensing and environmental engineering.'
      },
      {
        name: 'Research_Statement_Exemplar_Hydrologic_RemoteSensing.pdf',
        type: 'pdf',
        size: '1.4 MB',
        description: 'Annotated 3-page research statement demonstrating how to articulate a coherent federal funding roadmap for tenure-track positions.'
      },
      {
        name: 'UA Box: Faculty & Postdoc Application Dossier Archive',
        type: 'box',
        size: 'Cloud Workspace',
        description: 'UA Box folder with sample cover letters, teaching philosophies, and diversity statements from successful lab alumni.',
        url: 'https://ua.box.com'
      }
    ],
    tags: ['Academic Jobs', 'Tenure Track', 'Postdoc', 'National Labs', 'NOAA', 'USGS', 'CV Template']
  }
];

export const ProfessionalDevelopment: React.FC<{ currentUser?: UserType | null }> = ({ currentUser }) => {
  const isAdmin = currentUser?.role === 'Admin';
  const [posts, setPosts] = useState<MentorshipPost[]>(() => {
    const saved = localStorage.getItem('ersl_professional_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return initialPosts;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<MentorshipPost | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // New Post Form State (for Admin)
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MentorshipPost['category']>('guidance');
  const [newLead, setNewLead] = useState('');
  const [newSectionHeading, setNewSectionHeading] = useState('');
  const [newSectionBody, setNewSectionBody] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newAttachments, setNewAttachments] = useState<GuideAttachment[]>([]);
  const [pendingBoxUrl, setPendingBoxUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { key: 'all', label: 'All Mentorship Posts' },
    { key: 'guidance', label: '📚 Paper Writing & Formatting' },
    { key: 'peer_review', label: '✍️ Reviewer Rebuttals & Responses' },
    { key: 'grants', label: '🎓 NASA & NSF Fellowship Grants' },
    { key: 'open_science', label: '💻 Open Science & GitHub/Conda' },
    { key: 'conferences', label: '📢 AGU & IGARSS Posters & Talks' },
    { key: 'careers', label: '🚀 Academic & Lab Careers' },
  ];

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        post.title.toLowerCase().includes(q) ||
        post.lead.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q)) ||
        post.sections.some(s => s.heading.toLowerCase().includes(q) || s.body.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const handleDownload = (att: GuideAttachment) => {
    if (att.url) {
      window.open(att.url, '_blank');
      return;
    }
    // Simulate generation and download of formatted pack
    const element = document.createElement('a');
    const dummyContent = `=================================================================\n${att.name}\nUniversity of Alabama - Environmental Remote Sensing Laboratory (ERSL)\n=================================================================\n\nDescription: ${att.description}\nCategory: Professional Development & Academic Writing Resource\nLaboratory: ERSL (Dr. Hongxing Liu)\n\nThis certified ERSL lab document is ready for research and manuscript preparation.\nFor full source repositories and Overleaf templates, refer to the lab UA Box workspace.\n`;
    const file = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = att.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setDownloadSuccessMessage(`📥 Successfully downloaded "${att.name}"!`);
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  const handleAddAttachmentFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    let type: GuideAttachment['type'] = 'other';
    if (ext === 'pdf') type = 'pdf';
    else if (ext === 'doc' || ext === 'docx') type = 'docx';
    else if (ext === 'tex') type = 'tex';
    else if (ext === 'py') type = 'py';
    else if (ext === 'xls' || ext === 'xlsx') type = 'xlsx';
    else if (ext === 'zip' || ext === 'tar' || ext === 'gz') type = 'zip';

    const sizeFormatted = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const newAtt: GuideAttachment = {
      name: file.name,
      type,
      size: sizeFormatted,
      description: `Uploaded material (${file.name})`
    };

    setNewAttachments(prev => [...prev, newAtt]);
    if (e.target) e.target.value = '';
  };

  const handleAddBoxLink = () => {
    if (!pendingBoxUrl.trim()) return;
    setNewAttachments(prev => [
      ...prev,
      {
        name: 'UA Box Cloud Workspace Resource',
        type: 'box',
        size: 'UA Box Cloud Storage',
        description: 'Direct link to lab Box workspace materials',
        url: pendingBoxUrl.trim()
      }
    ]);
    setPendingBoxUrl('');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLead.trim()) return;

    const categoryLabels: Record<string, string> = {
      guidance: 'Manuscript Masterclass',
      peer_review: 'Reviewer Rebuttal Toolkit',
      grants: 'Grant Proposal Blueprint',
      open_science: 'Open Science Standard',
      conferences: 'Symposia & Presentations',
      careers: 'Career Pathways'
    };

    const newPost: MentorshipPost = {
      id: `post-${Date.now()}`,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory] || 'Mentorship Guide',
      title: newTitle.trim(),
      author: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'ERSL Mentorship Committee',
      date: 'Published ' + new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      readTime: '5 min read',
      lead: newLead.trim(),
      sections: [
        {
          heading: newSectionHeading.trim() || 'Key Guidelines & Best Practices',
          body: newSectionBody.trim() || newLead.trim(),
          keyTips: ['Carefully review the attached template and documentation before implementation.']
        }
      ],
      attachments: newAttachments,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem('ersl_professional_posts', JSON.stringify(updated));

    // Reset Form
    setNewTitle('');
    setNewLead('');
    setNewSectionHeading('');
    setNewSectionBody('');
    setNewTags('');
    setNewAttachments([]);
    setShowAddModal(false);
  };

  const getAttachmentIcon = (type: GuideAttachment['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-600 shrink-0" />;
      case 'docx': return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'tex': return <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'py': return <FileCode className="w-4 h-4 text-teal-600 shrink-0" />;
      case 'xlsx': return <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />;
      case 'box': return <FolderGit2 className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'zip': return <Archive className="w-4 h-4 text-purple-600 shrink-0" />;
      default: return <Paperclip className="w-4 h-4 text-slate-600 shrink-0" />;
    }
  };

  const getAttachmentBadge = (type: GuideAttachment['type']) => {
    switch (type) {
      case 'pdf': return 'bg-red-50 text-red-700 border-red-200';
      case 'docx': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'tex': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'py': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'xlsx': return 'bg-green-50 text-green-700 border-green-200';
      case 'box': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'zip': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left select-none">
      
      {/* Toast Notification */}
      {downloadSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200 border border-emerald-500">
          <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-white/15 text-white border border-white/20 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
              <span>🔐 RESTRICTED LAB VAULT</span>
            </span>
            <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
              MEMBER RESOURCES & WRITING BLOGS
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            Professional Development & Scientific Writing Hub
          </h2>
          <p className="text-xs md:text-sm text-red-100 mt-2 leading-relaxed">
            In-depth academic blog posts, journal manuscript blueprints, peer-review rebuttal formulas, fellowship grant frameworks, and downloadable templates for ERSL researchers.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/15 text-xs text-red-100">
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-red-200" />
              <span><strong>{posts.length}</strong> Complete Mentorship Guides</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Download className="w-4 h-4 text-red-200" />
              <span><strong>{posts.reduce((acc, p) => acc + p.attachments.length, 0)}</strong> Downloadable Template Packs</span>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-[#9E1B32] hover:bg-red-50 text-xs font-extrabold px-3.5 py-1.5 rounded-lg shadow-sm transition-all ml-auto flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post New Guide / Material</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search guides by title, manuscript sections, or keywords (e.g., LaTeX, Reviewer, FINESST, SWOT, Poster)..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#9E1B32] shadow-2xs font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pill Buttons */}
        <div className="flex flex-wrap gap-2 pb-1 border-b border-gray-100">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-[#9E1B32] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-gray-200 hover:border-[#9E1B32] hover:text-[#9E1B32]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700 text-sm">No mentorship guides match your search.</h3>
            <p className="text-xs text-gray-400 mt-1">Try searching for other keywords or select All Mentorship Posts.</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <article 
              key={post.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-xs hover:shadow-md transition-all space-y-5 group"
            >
              {/* Post Header Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-[#9E1B32] border border-red-100">
                    {post.categoryLabel}
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{post.readTime}</span>
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {post.date}
                  </span>
                </div>
                <div className="flex items-center text-[11px] text-gray-500 font-semibold">
                  <User className="w-3.5 h-3.5 mr-1 text-[#9E1B32]" />
                  <span>{post.author}</span>
                </div>
              </div>

              {/* Title & Lead Summary */}
              <div className="space-y-2">
                <h3 
                  onClick={() => setSelectedPost(post)}
                  className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-[#9E1B32] transition-colors cursor-pointer leading-tight"
                >
                  {post.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
                  {post.lead}
                </p>
              </div>

              {/* Highlighted Section Preview */}
              {post.sections.length > 0 && (
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100 space-y-2.5 text-xs text-slate-700">
                  <h4 className="font-extrabold text-slate-800 flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{post.sections[0].heading}</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed line-clamp-3">
                    {post.sections[0].body}
                  </p>
                  {post.sections[0].keyTips && post.sections[0].keyTips.length > 0 && (
                    <div className="flex items-start space-x-2 bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5 text-[11px] text-amber-950 font-medium">
                      <span className="font-bold text-amber-800 shrink-0">💡 Pro Tip:</span>
                      <span>{post.sections[0].keyTips[0]}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Attached Files & Downloadable Materials Box */}
              {post.attachments.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <Paperclip className="w-4 h-4 text-[#9E1B32]" />
                      <span>Attached Templates & Reference Files ({post.attachments.length})</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Direct Download Available</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {post.attachments.map((att, attIdx) => (
                      <div 
                        key={attIdx}
                        className="bg-white border border-gray-200 hover:border-gray-300 rounded-lg p-3 flex items-start justify-between gap-2.5 transition-all shadow-2xs group/att"
                      >
                        <div className="flex items-start space-x-2.5 min-w-0">
                          <div className="p-1.5 rounded-md bg-slate-100 shrink-0 mt-0.5">
                            {getAttachmentIcon(att.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase ${getAttachmentBadge(att.type)}`}>
                                {att.type}
                              </span>
                              <p className="font-bold text-xs text-slate-800 truncate" title={att.name}>{att.name}</p>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{att.description}</p>
                            <span className="text-[10px] text-gray-400 font-medium mt-1 block">Size: {att.size}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownload(att)}
                          className="bg-slate-100 hover:bg-[#9E1B32] text-slate-700 hover:text-white border border-gray-200 hover:border-[#9E1B32] p-1.5 rounded-md cursor-pointer transition-colors shrink-0 shadow-2xs"
                          title={att.type === 'box' ? 'Open in UA Box' : 'Download file'}
                        >
                          {att.type === 'box' ? (
                            <ExternalLink className="w-3.5 h-3.5" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Footer: Tags & Read Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md hover:bg-slate-200 transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="bg-[#9E1B32] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 shadow-xs"
                >
                  <span>Read Full Mentorship Guide</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* FULL-SCREEN EXPANDED ARTICLE READING MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl flex flex-col border border-gray-100 overflow-hidden text-left">
            {/* Modal Header Bar */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center space-x-2 truncate">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-[#9E1B32]">
                  {selectedPost.categoryLabel}
                </span>
                <span className="text-xs font-bold text-gray-500">· {selectedPost.readTime}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Article Content */}
            <div className="p-6 md:p-10 overflow-y-auto space-y-6 flex-1">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-snug">
                  {selectedPost.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 font-medium">
                  <span>✍️ By <strong>{selectedPost.author}</strong></span>
                  <span>📅 {selectedPost.date}</span>
                </div>
              </div>

              {/* Lead Paragraph */}
              <div className="bg-red-50/60 border-l-4 border-[#9E1B32] p-4 rounded-r-xl text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
                {selectedPost.lead}
              </div>

              {/* Article Sections */}
              <div className="space-y-8">
                {selectedPost.sections.map((section, sidx) => (
                  <div key={sidx} className="space-y-3">
                    <h3 className="text-base md:text-lg font-extrabold text-slate-900 pb-1 border-b border-gray-100">
                      {section.heading}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                      {section.body}
                    </p>

                    {section.keyTips && section.keyTips.length > 0 && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-1.5 mt-3">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Actionable Writing Rules:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-amber-950 pl-1">
                          {section.keyTips.map((tip, tidx) => (
                            <li key={tidx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Attached Files Card in Modal */}
              {selectedPost.attachments.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 mt-8">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-[#9E1B32]" />
                      Downloadable Packages & Reference Files ({selectedPost.attachments.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedPost.attachments.map((att, attIdx) => (
                      <div 
                        key={attIdx}
                        className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                            {getAttachmentIcon(att.type)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase ${getAttachmentBadge(att.type)}`}>
                                {att.type}
                              </span>
                              <p className="font-bold text-xs text-slate-900">{att.name}</p>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{att.description}</p>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">File size: {att.size}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownload(att)}
                          className="bg-[#9E1B32] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center space-x-1.5 shrink-0 shadow-xs"
                        >
                          {att.type === 'box' ? (
                            <>
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open in Box</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download File</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">
                Protected resource for certified University of Alabama ERSL members.
              </span>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW POST MODAL (FOR ADMIN) */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col border border-gray-100 overflow-hidden text-left">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-[#9E1B32]" />
                <h3 className="font-extrabold text-slate-800 text-base">Publish New Mentorship Guide & Attach Files</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Guide Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Masterclass on Designing Spatial Water Quality Figures..."
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32] bg-white cursor-pointer font-bold text-slate-800"
                  >
                    <option value="guidance">📚 Manuscript Masterclass</option>
                    <option value="peer_review">✍️ Reviewer Rebuttal Toolkit</option>
                    <option value="grants">🎓 Grant Proposal Blueprint</option>
                    <option value="open_science">💻 Open Science & Code Archiving</option>
                    <option value="conferences">📢 Symposia & Presentations</option>
                    <option value="careers">🚀 Career Pathways</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    placeholder="e.g. Remote Sensing, Figures, LaTeX"
                    className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Executive Summary / Lead Paragraph</label>
                <textarea
                  rows={2}
                  required
                  value={newLead}
                  onChange={e => setNewLead(e.target.value)}
                  placeholder="Brief overview explaining what researchers will learn from this guide..."
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Section 1: Heading</label>
                <input
                  type="text"
                  value={newSectionHeading}
                  onChange={e => setNewSectionHeading(e.target.value)}
                  placeholder="e.g. 1. Core Principles of High-Resolution GeoAI Pipelines"
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Section 1: Detailed Guidance Body</label>
                <textarea
                  rows={4}
                  value={newSectionBody}
                  onChange={e => setNewSectionBody(e.target.value)}
                  placeholder="Write the full instructions, guidelines, recommendations, and methodologies..."
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32] leading-relaxed"
                />
              </div>

              {/* Attachments Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#9E1B32]" />
                    <span>Attach Files & Materials ({newAttachments.length})</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAddAttachmentFromFile} 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white border border-gray-300 hover:bg-slate-50 text-slate-700 text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                    >
                      + Choose File
                    </button>
                  </div>
                </div>

                {/* Box Link Input */}
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <input
                    type="url"
                    value={pendingBoxUrl}
                    onChange={e => setPendingBoxUrl(e.target.value)}
                    placeholder="Or paste UA Box workspace URL (e.g. https://ua.box.com/s/...)"
                    className="flex-1 text-[11px] p-1.5 border rounded-lg bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddBoxLink}
                    disabled={!pendingBoxUrl.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    Add Box Link
                  </button>
                </div>

                {/* Attached items list */}
                {newAttachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {newAttachments.map((att, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-2 truncate">
                          {getAttachmentIcon(att.type)}
                          <span className="font-bold truncate max-w-xs">{att.name}</span>
                          <span className="text-gray-400">({att.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewAttachments(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9E1B32] hover:bg-red-800 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Publish Mentorship Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
