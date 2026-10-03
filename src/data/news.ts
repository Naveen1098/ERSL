export interface NewsItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  link?: string;
}

// Public news shown on the home page. Newest first. Edit this list and push to publish.
export const newsItems: NewsItem[] = [
  {
    id: 'n-1',
    date: '2026-09-15',
    title: 'ERSL welcomes new graduate researchers for Fall 2026',
    summary:
      'The lab has expanded its team with new PhD students working on SWOT-based reservoir monitoring and GeoAI water quality mapping.',
  },
  {
    id: 'n-2',
    date: '2026-08-02',
    title: 'New paper on satellite-based flood inundation mapping',
    summary:
      'Our latest study on reach-scale flood depth mapping in the Black Warrior River basin is now available in the Publications tab.',
  },
  {
    id: 'n-3',
    date: '2026-06-20',
    title: 'Field campaign: UAV LiDAR and ADCP river surveys',
    summary:
      'The team completed a coordinated field campaign aligned with NASA SWOT passes. See the Field Photos tab for images.',
  },
];
