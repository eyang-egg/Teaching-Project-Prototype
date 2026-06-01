// data.jsx — sample course library + course generation for Lyceum
// Exposed on window for sibling babel scripts.

// ---- Lesson content used by the lesson player (one fully written sample) ----
const INVESTING_LESSON_CONTENT = {
  estMin: 9,
  sections: [
    {
      kind: "prose",
      heading: "What investing actually is",
      body:
        "Investing is the act of committing money today in the expectation of more money later. " +
        "The key word is expectation — there is no guarantee. What separates investing from saving " +
        "is that you accept some uncertainty in exchange for the chance of growth that outpaces inflation.",
    },
    {
      kind: "callout",
      label: "Mental model",
      body:
        "Think of every dollar as a small employee. Saving keeps it sitting still. Investing puts it to work — " +
        "some days it earns, some days it loses, but over a long enough horizon the productive ones compound.",
    },
    {
      kind: "prose",
      heading: "Risk and return are joined at the hip",
      body:
        "You cannot get higher expected returns without accepting higher variability along the way. Cash is " +
        "stable but barely keeps up with inflation. Stocks swing hard year to year but have historically " +
        "rewarded patience. Your job is not to avoid risk — it is to take the right amount for your time horizon.",
    },
    {
      kind: "figure",
      caption: "Growth of $10,000 over 30 years at different average annual returns",
      data: [
        { label: "Cash · ~1%", v: 13 },
        { label: "Bonds · ~4%", v: 32 },
        { label: "Stocks · ~7%", v: 76 },
      ],
    },
    {
      kind: "prose",
      heading: "Time is the quiet multiplier",
      body:
        "Compounding means your gains start earning gains of their own. Small differences in rate or in years " +
        "invested produce wildly different outcomes at the end. This is why starting early — even with small " +
        "amounts — beats starting later with more.",
    },
  ],
  quiz: {
    prompt: "Quick check",
    questions: [
      {
        q: "What primarily distinguishes investing from saving?",
        options: [
          "Investing is always safer",
          "Investing accepts uncertainty in exchange for potential growth",
          "Saving earns higher returns",
          "There is no real difference",
        ],
        answer: 1,
      },
      {
        q: "Why does starting early matter so much?",
        options: [
          "Markets only rise in the morning",
          "Fees are lower for young people",
          "Compounding gives gains more time to earn their own gains",
          "It doesn't — only the amount matters",
        ],
        answer: 2,
      },
    ],
  },
};

// ---- Course outline generators (deterministic-ish, keyed by subject) ----
function makeLesson(title, status = "available", hasQuiz = true) {
  return { id: "l" + Math.random().toString(36).slice(2, 9), title, status, hasQuiz };
}

const INVESTING_MODULES = [
  {
    title: "Foundations of Investing",
    lessons: [
      "What investing is (and isn't)",
      "Risk, return, and time horizon",
      "Compounding and inflation",
    ],
  },
  {
    title: "The Asset Classes",
    lessons: [
      "Stocks and equity ownership",
      "Bonds and fixed income",
      "Funds: index, mutual, and ETF",
    ],
  },
  {
    title: "Building a Portfolio",
    lessons: [
      "Diversification and allocation",
      "Risk tolerance and rebalancing",
      "Dollar-cost averaging",
    ],
  },
  {
    title: "Markets & Valuation",
    lessons: [
      "How markets price assets",
      "Reading a company, simply",
      "Bubbles, crashes, and behavior",
    ],
  },
  {
    title: "Accounts, Taxes & Fees",
    lessons: [
      "Brokerage vs. retirement accounts",
      "Tax basics for investors",
      "Fees and their long-term drag",
    ],
  },
  {
    title: "Putting It Into Practice",
    lessons: [
      "Writing an investment policy",
      "Your first portfolio",
    ],
  },
];

// Generic fallback outline for any subject the user types.
function genericModules(subject) {
  const s = subject.trim() || "Your Subject";
  return [
    { title: "Foundations", lessons: [`What ${s} is, end to end`, `Core vocabulary`, `The mental models that matter`] },
    { title: "Core Techniques", lessons: [`First principles`, `The everyday workflow`, `Common mistakes to avoid`] },
    { title: "Going Deeper", lessons: [`Intermediate methods`, `Working from real examples`, `Edge cases`] },
    { title: "Putting It Into Practice", lessons: [`A guided project`, `Your own practice plan`] },
  ];
}

function buildCourse({ subject, mode, depth, weeks, perWeek, minutes, deadline, status = "active", progressLessons = 0 }) {
  const isInvesting = /invest/i.test(subject);
  const blueprint = isInvesting ? INVESTING_MODULES : genericModules(subject);
  let count = 0;
  const flat = [];
  const modules = blueprint.map((m, mi) => {
    const lessons = m.lessons.map((t) => {
      const done = count < progressLessons;
      count++;
      const lesson = makeLesson(t, done ? "completed" : "available");
      lesson.content = isInvesting && flat.length === 0 ? INVESTING_LESSON_CONTENT : null;
      flat.push(lesson);
      return lesson;
    });
    return { id: "m" + mi + Math.random().toString(36).slice(2, 6), title: m.title, lessons };
  });
  const totalLessons = flat.length;
  return {
    id: "c" + Math.random().toString(36).slice(2, 9),
    subject: subject.trim() || "Untitled Course",
    mode,
    depth,
    weeks,
    perWeek,
    minutes,
    deadline: deadline || null,
    status,
    modules,
    totalLessons,
    completedLessons: progressLessons,
    hasPlacement: mode === "new",
    hasFinal: mode !== "quick",
    createdAt: Date.now(),
  };
}

// ---- Seed library: one in-progress + one completed + one review ----
function seedCourses() {
  const investing = buildCourse({
    subject: "Investing",
    mode: "new",
    depth: "standard",
    weeks: 6,
    perWeek: 3,
    minutes: 30,
    deadline: null,
    status: "active",
    progressLessons: 5,
  });
  const piano = buildCourse({
    subject: "Jazz Piano Improvisation",
    mode: "new",
    depth: "deep",
    weeks: 10,
    perWeek: 2,
    minutes: 45,
    deadline: null,
    status: "active",
    progressLessons: 3,
  });
  const spanish = buildCourse({
    subject: "Spanish Grammar Essentials",
    mode: "review",
    depth: "standard",
    weeks: 4,
    perWeek: 4,
    minutes: 20,
    deadline: null,
    status: "completed",
    progressLessons: 999,
  });
  // clamp completed counts
  [investing, piano, spanish].forEach((c) => {
    c.completedLessons = Math.min(c.completedLessons, c.totalLessons);
    if (c.status === "completed") c.completedLessons = c.totalLessons;
  });
  return [investing, piano, spanish];
}

window.LyceumData = { buildCourse, seedCourses, INVESTING_LESSON_CONTENT };
