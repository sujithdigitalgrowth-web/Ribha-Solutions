export interface SkillTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface SkillTestConfig {
  skillId: string;
  skillName: string;
  icon: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: SkillTestQuestion[];
}

const REACT_QUESTIONS: SkillTestQuestion[] = [
  { id: 'r1', question: 'What hook is used to manage state in a functional component?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctIndex: 0 },
  { id: 'r2', question: 'What does the key prop help React identify?', options: ['Component type', 'Which items have changed', 'Event handlers', 'Styles'], correctIndex: 1 },
  { id: 'r3', question: 'Which method is used to update state in a class component?', options: ['this.update()', 'this.setState()', 'this.changeState()', 'this.modify()'], correctIndex: 1 },
  { id: 'r4', question: 'What is JSX?', options: ['A JavaScript library', 'Syntax extension for JavaScript', 'A CSS framework', 'A build tool'], correctIndex: 1 },
  { id: 'r5', question: 'When does useEffect run by default?', options: ['Only on mount', 'After every render', 'Only when dependencies change', 'Never'], correctIndex: 1 },
  { id: 'r6', question: 'What is the virtual DOM?', options: ['A real DOM copy', 'A lightweight JS representation of the DOM', 'A database', 'A server'], correctIndex: 1 },
  { id: 'r7', question: 'Which is used to pass data from parent to child?', options: ['State', 'Props', 'Context', 'Refs'], correctIndex: 1 },
  { id: 'r8', question: 'What does useMemo optimize?', options: ['Network requests', 'Expensive calculations', 'Rendering speed', 'Bundle size'], correctIndex: 1 },
  { id: 'r9', question: 'Which lifecycle runs after a component updates?', options: ['componentDidMount', 'componentDidUpdate', 'componentWillUnmount', 'componentWillUpdate'], correctIndex: 1 },
  { id: 'r10', question: 'What is React Router used for?', options: ['State management', 'Client-side routing', 'API calls', 'Styling'], correctIndex: 1 },
];

const NODE_QUESTIONS: SkillTestQuestion[] = [
  { id: 'n1', question: 'What is Node.js built on?', options: ['Python', 'V8 JavaScript engine', 'Java', 'Ruby'], correctIndex: 1 },
  { id: 'n2', question: 'Which module is used for file system operations?', options: ['http', 'fs', 'path', 'os'], correctIndex: 1 },
  { id: 'n3', question: 'What does require() return?', options: ['A promise', 'The exported module', 'A string', 'An array'], correctIndex: 1 },
  { id: 'n4', question: 'Which is the correct way to create an Express server?', options: ['express.create()', 'express()', 'new Express()', 'Express.server()'], correctIndex: 1 },
  { id: 'n5', question: 'What is middleware in Express?', options: ['A database', 'Functions that have access to req, res, next', 'A template engine', 'A testing framework'], correctIndex: 1 },
  { id: 'n6', question: 'Which method sends a JSON response in Express?', options: ['res.sendJSON()', 'res.json()', 'res.return()', 'res.output()'], correctIndex: 1 },
  { id: 'n7', question: 'What does process.env contain?', options: ['Database config', 'Environment variables', 'File paths', 'Dependencies'], correctIndex: 1 },
  { id: 'n8', question: 'Which package manager comes with Node.js?', options: ['yarn', 'npm', 'pnpm', 'bun'], correctIndex: 1 },
  { id: 'n9', question: 'What is the event loop?', options: ['A debugging tool', 'Mechanism for handling async operations', 'A testing framework', 'A build step'], correctIndex: 1 },
  { id: 'n10', question: 'Which HTTP method is typically used for creating resources?', options: ['GET', 'PUT', 'POST', 'DELETE'], correctIndex: 2 },
];

const FIGMA_QUESTIONS: SkillTestQuestion[] = [
  { id: 'f1', question: 'What is a Frame in Figma?', options: ['A photo', 'A container for design elements', 'A video', 'A font'], correctIndex: 1 },
  { id: 'f2', question: 'What does Auto Layout do?', options: ['Exports assets', 'Creates responsive layouts', 'Adds animations', 'Generates code'], correctIndex: 1 },
  { id: 'f3', question: 'What are Components used for?', options: ['Comments only', 'Reusable design elements', 'Export settings', 'Version history'], correctIndex: 1 },
  { id: 'f4', question: 'What is a Variant?', options: ['A backup', 'Different states of a component', 'A plugin', 'A color'], correctIndex: 1 },
  { id: 'f5', question: 'Which tool creates vector shapes?', options: ['Text tool', 'Pen tool', 'Eyedropper', 'Comment'], correctIndex: 1 },
  { id: 'f6', question: 'What does the Inspect panel show?', options: ['Comments', 'CSS and layout properties', 'History', 'Plugins'], correctIndex: 1 },
  { id: 'f7', question: 'What is a Design System in Figma?', options: ['A single file', 'Shared styles, components, and guidelines', 'A plugin', 'A template'], correctIndex: 1 },
  { id: 'f8', question: 'What does Prototype mode enable?', options: ['Export only', 'Interactive flows and transitions', 'Collaboration', 'Version control'], correctIndex: 1 },
  { id: 'f9', question: 'What is a constraint?', options: ['A comment', 'Rule for how elements resize', 'A plugin', 'A color'], correctIndex: 1 },
  { id: 'f10', question: 'Which format is best for web assets?', options: ['PDF', 'SVG for icons, PNG for images', 'DOC', 'PSD'], correctIndex: 1 },
];

const PYTHON_QUESTIONS: SkillTestQuestion[] = [
  { id: 'p1', question: 'Which is used to define a function in Python?', options: ['function', 'def', 'func', 'define'], correctIndex: 1 },
  { id: 'p2', question: 'What does len() return?', options: ['The last element', 'The number of items', 'The first element', 'A boolean'], correctIndex: 1 },
  { id: 'p3', question: 'Which creates an empty dictionary?', options: ['[]', '{}', '()', 'set()'], correctIndex: 1 },
  { id: 'p4', question: 'What is a list comprehension?', options: ['A comment', 'A concise way to create lists', 'A loop type', 'A function'], correctIndex: 1 },
  { id: 'p5', question: 'Which keyword handles exceptions?', options: ['catch', 'try/except', 'error', 'handle'], correctIndex: 1 },
  { id: 'p6', question: 'What does range(5) produce?', options: ['[0,1,2,3,4]', '0,1,2,3,4 (iterable)', '[1,2,3,4,5]', '5'], correctIndex: 1 },
  { id: 'p7', question: 'Which is immutable?', options: ['List', 'Dictionary', 'Tuple', 'Set'], correctIndex: 2 },
  { id: 'p8', question: 'What does import do?', options: ['Exports code', 'Loads a module', 'Deletes a file', 'Runs a script'], correctIndex: 1 },
  { id: 'p9', question: 'Which checks if a key exists in a dict?', options: ['key in dict', 'dict.has_key()', 'dict.contains()', 'dict.find()'], correctIndex: 0 },
  { id: 'p10', question: 'What is None in Python?', options: ['Zero', 'Empty string', 'Null/absence of value', 'False'], correctIndex: 2 },
];

const SEO_QUESTIONS: SkillTestQuestion[] = [
  { id: 's1', question: 'What does SEO stand for?', options: ['Search Engine Optimization', 'Site Enhancement Online', 'Search Entry Optimization', 'System Engine Output'], correctIndex: 0 },
  { id: 's2', question: 'Which tag is most important for page titles?', options: ['<div>', '<h1>', '<title>', '<header>'], correctIndex: 2 },
  { id: 's3', question: 'What is meta description used for?', options: ['Page styling', 'Search result snippet', 'Internal links', 'Images'], correctIndex: 1 },
  { id: 's4', question: 'What does backlink mean?', options: ['Link from your site', 'Link from another site to yours', 'Broken link', 'Internal link'], correctIndex: 1 },
  { id: 's5', question: 'Which affects mobile ranking?', options: ['Desktop-only design', 'Mobile-friendly design', 'Flash content', 'Pop-ups'], correctIndex: 1 },
  { id: 's6', question: 'What is keyword density?', options: ['Font size', 'How often a keyword appears', 'Page load time', 'Image count'], correctIndex: 1 },
  { id: 's7', question: 'Which improves page speed?', options: ['Large images', 'Minified CSS/JS', 'Many redirects', 'Heavy scripts'], correctIndex: 1 },
  { id: 's8', question: 'What is alt text for?', options: ['Styling', 'Image description for accessibility/SEO', 'Links', 'Titles'], correctIndex: 1 },
  { id: 's9', question: 'What does canonical URL prevent?', options: ['Slow loading', 'Duplicate content issues', 'Broken links', '404 errors'], correctIndex: 1 },
  { id: 's10', question: 'Which is an on-page SEO factor?', options: ['Social shares', 'Header structure (H1, H2)', 'Backlinks', 'Domain age'], correctIndex: 1 },
];

const CONTENT_WRITING_QUESTIONS: SkillTestQuestion[] = [
  { id: 'c1', question: 'What is a hook in copywriting?', options: ['A link', 'Opening that grabs attention', 'A conclusion', 'A footnote'], correctIndex: 1 },
  { id: 'c2', question: 'What does CTA stand for?', options: ['Content Type Approval', 'Call To Action', 'Copy Text Analysis', 'Click Through Agreement'], correctIndex: 1 },
  { id: 'c3', question: 'What is tone of voice?', options: ['Volume level', 'Personality and style of writing', 'Grammar rules', 'Word count'], correctIndex: 1 },
  { id: 'c4', question: 'Which improves readability?', options: ['Long paragraphs', 'Short sentences and subheadings', 'Jargon', 'Passive voice'], correctIndex: 1 },
  { id: 'c5', question: 'What is a target audience?', options: ['Competitors', 'Specific group you write for', 'Search engines', 'Editors'], correctIndex: 1 },
  { id: 'c6', question: 'What is plagiarism?', options: ['Original work', 'Using others\' work without credit', 'Paraphrasing', 'Citation'], correctIndex: 1 },
  { id: 'c7', question: 'Which is active voice?', options: ['The report was written by John', 'John wrote the report', 'The report', 'Writing the report'], correctIndex: 1 },
  { id: 'c8', question: 'What is a headline\'s main job?', options: ['Summarize everything', 'Get readers to continue', 'Include keywords', 'Be long'], correctIndex: 1 },
  { id: 'c9', question: 'What is SEO copywriting?', options: ['Writing for print only', 'Writing that ranks and converts', 'Technical writing', 'Creative fiction'], correctIndex: 1 },
  { id: 'c10', question: 'What does proofreading catch?', options: ['Ideas', 'Spelling, grammar, typos', 'Tone', 'Structure'], correctIndex: 1 },
];

const DATA_ENTRY_QUESTIONS: SkillTestQuestion[] = [
  { id: 'd1', question: 'What is data validation?', options: ['Deleting data', 'Checking data for accuracy', 'Formatting only', 'Exporting data'], correctIndex: 1 },
  { id: 'd2', question: 'Which shortcut selects all in a spreadsheet?', options: ['Ctrl+S', 'Ctrl+A', 'Ctrl+C', 'Ctrl+V'], correctIndex: 1 },
  { id: 'd3', question: 'What does CSV stand for?', options: ['Comma-Separated Values', 'Column Sheet View', 'Data format', 'Chart format'], correctIndex: 0 },
  { id: 'd4', question: 'What is a delimiter?', options: ['A formula', 'Character that separates data (e.g. comma)', 'A column', 'A row'], correctIndex: 1 },
  { id: 'd5', question: 'Which ensures consistent data entry?', options: ['Free text', 'Dropdown lists', 'Manual typing', 'Copy-paste'], correctIndex: 1 },
  { id: 'd6', question: 'What is double-entry verification?', options: ['One person enters twice', 'Two people enter same data and compare', 'Two columns', 'Two files'], correctIndex: 1 },
  { id: 'd7', question: 'Which key moves to next cell in Excel?', options: ['Enter (down)', 'Tab (right)', 'Both Tab and Enter', 'Space'], correctIndex: 2 },
  { id: 'd8', question: 'What does KPI stand for?', options: ['Key Process Input', 'Key Performance Indicator', 'Knowledge Process', 'Key Data Point'], correctIndex: 1 },
  { id: 'd9', question: 'What is a duplicate check?', options: ['Finding repeated records', 'Backing up data', 'Formatting', 'Sorting'], correctIndex: 0 },
  { id: 'd10', question: 'Which improves data entry speed?', options: ['Long forms', 'Keyboard shortcuts', 'Manual checks only', 'No validation'], correctIndex: 1 },
];

export const SKILL_TESTS: SkillTestConfig[] = [
  { skillId: 'react', skillName: 'React / Frontend', icon: '⚛️', passingScore: 70, timeLimitMinutes: 15, questions: REACT_QUESTIONS },
  { skillId: 'nodejs', skillName: 'Node.js / Backend', icon: '🟢', passingScore: 70, timeLimitMinutes: 15, questions: NODE_QUESTIONS },
  { skillId: 'figma', skillName: 'Figma / Design', icon: '🎨', passingScore: 70, timeLimitMinutes: 15, questions: FIGMA_QUESTIONS },
  { skillId: 'python', skillName: 'Python', icon: '🐍', passingScore: 70, timeLimitMinutes: 15, questions: PYTHON_QUESTIONS },
  { skillId: 'seo', skillName: 'SEO / Marketing', icon: '📈', passingScore: 70, timeLimitMinutes: 15, questions: SEO_QUESTIONS },
  { skillId: 'content', skillName: 'Content Writing', icon: '✍️', passingScore: 70, timeLimitMinutes: 15, questions: CONTENT_WRITING_QUESTIONS },
  { skillId: 'dataentry', skillName: 'Data Entry', icon: '📋', passingScore: 70, timeLimitMinutes: 15, questions: DATA_ENTRY_QUESTIONS },
];

export function getSkillTestById(skillId: string): SkillTestConfig | null {
  return SKILL_TESTS.find((t) => t.skillId === skillId) ?? null;
}
