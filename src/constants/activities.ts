import type { Activity } from '../types/activity';

export const ACTIVITIES: Activity[] = [
  // ── Relationship ────────────────────────────────────────────────
  {
    id: '1',
    title: 'Gratitude Mapping',
    description:
      'Map the people who have positively impacted you recently and find concrete ways to express appreciation.',
    steps: [
      'List 3–5 people who supported you in the last week.',
      'Write one specific thing each person did that helped you.',
      'Note one small way you could give back or acknowledge them.',
      'Send at least one message of appreciation today.',
    ],
    neuroscienceTip:
      'Practicing gratitude activates dopaminergic reward pathways and shifts attention toward safety and connection, which can buffer against stress.',
    category: 'relationship',
    estimatedMinutes: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '2',
    title: 'Support Circle',
    description:
      'Identify your emotional support circle and how you might reach out in moments of challenge.',
    steps: [
      'Write down 3 people you trust when you are struggling.',
      'For each person, note one way they tend to support you (listening, advice, presence).',
      'Write one low-friction way you could reach out to each of them this week.',
      'Schedule or send one outreach message right now.',
    ],
    neuroscienceTip:
      'Feeling socially supported reduces amygdala reactivity and helps regulate the nervous system, making it easier to think clearly under stress.',
    category: 'relationship',
    estimatedMinutes: 10,
    imageUrl:
      'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '3',
    title: 'Hopeful Listening',
    description:
      'Practice listening to someone you care about with curiosity and hope, rather than fixing or judging.',
    steps: [
      'Choose one person you will intentionally listen to today.',
      'During your next conversation, focus on mirroring back what you heard rather than solving.',
      'Ask one open question that invites them to say more.',
      'Write down one moment where you noticed a shift in their energy or tone.',
    ],
    neuroscienceTip:
      'Being deeply heard increases oxytocin and vagal tone, which strengthens attachment bonds and fosters long-term resilience.',
    category: 'relationship',
    estimatedMinutes: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1520975958225-3f61f6cbf2aa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '4',
    title: 'Conflict Repair',
    description:
      'Move through a lingering conflict by identifying your role and taking one repair action.',
    steps: [
      'Name one unresolved tension in a relationship that is draining energy.',
      'Write down your contribution to the tension without blaming the other person.',
      'Draft a one-sentence repair statement that acknowledges the impact.',
      'Decide on the right moment and method to share it.',
    ],
    neuroscienceTip:
      'Rupture-repair cycles in relationships actually strengthen trust over time. Repair activates the parasympathetic nervous system and signals safety.',
    category: 'relationship',
    estimatedMinutes: 14,
    imageUrl:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80',
  },
  // ── Self ────────────────────────────────────────────────────────
  {
    id: '5',
    title: 'Body Scan Check-In',
    description:
      'Tune into your body to identify where you are holding tension and gently release it.',
    steps: [
      'Find a quiet place and close your eyes for two minutes.',
      'Slowly scan from your head down to your feet, noticing any tightness.',
      'Take three slow breaths directed toward the area of greatest tension.',
      'Journal one sentence about what your body is communicating to you.',
    ],
    neuroscienceTip:
      'Interoceptive awareness — noticing internal body signals — activates the insula cortex and helps regulate emotional intensity.',
    category: 'self',
    estimatedMinutes: 10,
    imageUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '6',
    title: 'Values Compass',
    description:
      'Clarify what matters most to you so your daily actions stay aligned with your deeper purpose.',
    steps: [
      'Write down 10 things you care deeply about (family, creativity, health, etc.).',
      'Narrow the list to your top 3 core values.',
      'For each value, rate how aligned your last week was on a scale of 1–10.',
      'Write one action you will take this week to honour your lowest-rated value.',
    ],
    neuroscienceTip:
      'Reflecting on personal values activates the ventromedial prefrontal cortex, which is linked to self-continuity and long-term motivation.',
    category: 'self',
    estimatedMinutes: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '7',
    title: 'Self-Compassion Letter',
    description:
      'Write a letter to yourself the way a kind friend would — acknowledging struggle without judgment.',
    steps: [
      'Think of a recent situation where you were hard on yourself.',
      'Write 3–5 sentences as if you are a compassionate friend responding to that situation.',
      'Notice what you left out and add one more sentence of encouragement.',
      'Read the letter aloud slowly and notice how your body responds.',
    ],
    neuroscienceTip:
      'Self-compassion practices reduce cortisol and increase heart rate variability, signalling safety to the nervous system and reducing self-criticism loops.',
    category: 'self',
    estimatedMinutes: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  },
  // ── Growth ──────────────────────────────────────────────────────
  {
    id: '8',
    title: 'Fear Inventory',
    description:
      'Surface hidden fears that may be quietly blocking growth and examine them without judgment.',
    steps: [
      'List 5 things you have been avoiding or procrastinating on.',
      'For each item, write the core fear underneath the avoidance.',
      'Circle the fear that feels most limiting right now.',
      'Write the smallest possible action that would move you toward it today.',
    ],
    neuroscienceTip:
      'Naming a fear — "affect labelling" — reduces amygdala activation and increases prefrontal control, making it easier to act despite discomfort.',
    category: 'growth',
    estimatedMinutes: 14,
    imageUrl:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '9',
    title: 'Growth-Edge Challenge',
    description:
      'Identify one skill just beyond your comfort zone and design a micro-experiment to stretch into it.',
    steps: [
      'Describe one area of life where you feel stuck or limited.',
      'Imagine the version of yourself who has grown past this — what does that person do differently?',
      'Design a 5-minute experiment you can run today to practice one of those behaviours.',
      'Debrief afterwards: what did you notice? What surprised you?',
    ],
    neuroscienceTip:
      'Deliberate practice in discomfort builds new neural pathways through neuroplasticity — the brain physically rewires with each attempt.',
    category: 'growth',
    estimatedMinutes: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '10',
    title: 'Failure Reframe',
    description:
      'Transform a recent setback into a source of insight and forward momentum.',
    steps: [
      'Describe a recent failure or disappointment in two sentences.',
      'List three things you learned or that unexpectedly resulted from that experience.',
      'Identify one assumption this failure challenged that was holding you back.',
      'Write one sentence: "Because of this, I am now better prepared to…"',
    ],
    neuroscienceTip:
      'Post-failure reflection engages the anterior cingulate cortex to update predictions, converting disappointment into adaptive learning and resilience.',
    category: 'growth',
    estimatedMinutes: 10,
    imageUrl:
      'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80',
  },
];

// Backward-compat alias — keeps working even with stale Metro module cache
export { ACTIVITIES as activities };
