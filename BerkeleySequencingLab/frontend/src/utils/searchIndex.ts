export interface StaticPage {
  title: string
  description: string
  url: string
  keywords: string[]
}

export const staticPages: StaticPage[] = [
  {
    title: 'Home',
    description: 'Berkeley Sequencing Lab - DNA sequencing made easier, faster, and more trustworthy',
    url: '/hero',
    keywords: ['home', 'sequencing', 'dna', 'berkeley', 'lab'],
  },
  {
    title: 'Order Forms',
    description: 'Submit DNA sequencing orders - Sanger, Nanopore, and more',
    url: '/form',
    keywords: ['order', 'form', 'submit', 'sanger', 'nanopore', 'sample'],
  },
  {
    title: 'Dashboard',
    description: 'View your order history and track sample status',
    url: '/dashboard',
    keywords: ['dashboard', 'orders', 'status', 'history', 'tracking'],
  },
  {
    title: 'FAQ',
    description: 'Frequently asked questions about DNA sequencing services',
    url: '/faq',
    keywords: ['faq', 'questions', 'help', 'support', 'answers'],
  },
  {
    title: 'Calendar',
    description: 'Lab schedule, closures, holidays, and important deadlines',
    url: '/calendar',
    keywords: ['calendar', 'schedule', 'hours', 'closure', 'holiday', 'deadline'],
  },
  {
    title: 'Contact Us',
    description: 'Send feedback or get in touch with the sequencing lab',
    url: '/contact',
    keywords: ['contact', 'feedback', 'email', 'phone', 'support'],
  },
  {
    title: 'Links & Resources',
    description: 'Useful links for Berkeley departments, bioinformatics tools, and more',
    url: '/links',
    keywords: ['links', 'resources', 'tools', 'departments', 'bioinformatics'],
  },
  {
    title: 'Results Interpretation Guide',
    description: 'How to read Sanger chromatograms, quality scores, and file formats',
    url: '/results-guide',
    keywords: ['results', 'chromatogram', 'quality', 'ab1', 'seq', 'interpretation'],
  },
  {
    title: 'Team',
    description: 'Meet the Berkeley Sequencing Lab team and alumni',
    url: '/team',
    keywords: ['team', 'staff', 'students', 'alumni', 'people'],
  },
  {
    title: 'Social Media',
    description: 'Connect with the lab on LinkedIn, X/Twitter, and more',
    url: '/social',
    keywords: ['social', 'linkedin', 'twitter', 'youtube', 'media'],
  },
  {
    title: 'Terms & Conditions',
    description: 'Terms and conditions for using the sequencing lab services',
    url: '/terms',
    keywords: ['terms', 'conditions', 'policy', 'agreement', 'legal'],
  },
  {
    title: 'Sample Guidelines',
    description: 'Sample preparation requirements, volumes, concentrations, and tube labeling',
    url: '/sample-guidelines',
    keywords: ['sample', 'guidelines', 'preparation', 'volume', 'concentration', 'tube', 'labeling'],
  },
]
