// App.jsx — shell: tabs, state, generate flow, tweaks
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#c2643f",
  "promptLayout": "centered",
  "cardStyle": "spacious",
  "displayFont": "Newsreader"
}/*EDITMODE-END*/;

const ACCENTS = {
  "#c2643f": { ink: "#9a4e30", soft: "#f1e4dc" },   // terracotta
  "#5a7d54": { ink: "#456140", soft: "#e5ede2" },   // sage
  "#3f6470": { ink: "#2f4d57", soft: "#dde8ea" },   // slate-teal
  "#7a5b86": { ink: "#5f4669", soft: "#e9e1ed" },   // muted plum
};

function applyTweaks(t) {
  const root = document.documentElement;
  const a = ACCENTS[t.accent] || ACCENTS["#c2643f"];
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--accent-ink", a.ink);
  root.style.setProperty("--accent-soft", a.soft);
  root.style.setProperty("--serif", `"${t.displayFont}", Georgia, serif`);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useStateApp("create");
  const [courses, setCourses] = useStateApp(() => window.LyceumData.seedCourses());
  const [openId, setOpenId] = useStateApp(null);
  const [newCourseId, setNewCourseId] = useStateApp(null);
  const [lessonCtx, setLessonCtx] = useStateApp(null);

  useEffectApp(() => { applyTweaks(t); }, [t.accent, t.displayFont]);

  const handleGenerate = (spec) => {
    const course = window.LyceumData.buildCourse({
      subject: spec.subject,
      mode: spec.mode,
      depth: spec.depth,
      weeks: spec.weeks,
      perWeek: spec.perWeek,
      minutes: spec.minutes,
      deadline: spec.deadline,
      status: "active",
      progressLessons: 0,
    });
    setCourses((prev) => [course, ...prev]);
    setNewCourseId(course.id);
    setOpenId(course.id);
    setTab("library");
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  };

  const completeLesson = (course, lesson) => {
    setCourses((prev) => prev.map((c) => {
      if (c.id !== course.id) return c;
      let completed = 0;
      const modules = c.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => {
          const status = l.id === lesson.id ? "completed" : l.status;
          if (status === "completed") completed++;
          return { ...l, status };
        }),
      }));
      const allDone = completed >= c.totalLessons;
      return { ...c, modules, completedLessons: completed, status: allDone ? "completed" : c.status };
    }));
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">Lyceum</span>
        </div>
        <nav className="tabs">
          <button className={"tab" + (tab === "create" ? " active" : "")} onClick={() => setTab("create")}>
            <span className="tab-dot" /> Create
          </button>
          <button className={"tab" + (tab === "library" ? " active" : "")} onClick={() => setTab("library")}>
            <span className="tab-dot" /> Library
            {courses.length > 0 && <span className="tab-badge">{courses.length}</span>}
          </button>
        </nav>
        <div className="topbar-spacer" />
        <div className="user-chip">
          <span className="hide-sm">Mara Ellison</span>
          <span className="avatar">M</span>
        </div>
      </header>

      <main className="main">
        {tab === "create"
          ? <CreateTab onGenerate={handleGenerate} layout={t.promptLayout} />
          : <LibraryTab
              courses={courses}
              openId={openId}
              setOpenId={(id) => { setOpenId(id); if (id !== newCourseId) setNewCourseId(null); }}
              newCourseId={newCourseId}
              cardStyle={t.cardStyle === "compact" ? "compact" : "spacious"}
              onOpenLesson={(course, lesson) => setLessonCtx({ course, lesson })}
              goCreate={() => setTab("create")}
            />}
      </main>

      {lessonCtx && (
        <LessonPlayer ctx={lessonCtx} onClose={() => setLessonCtx(null)} onComplete={completeLesson} />
      )}

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakColor label="Accent" value={t.accent}
          options={Object.keys(ACCENTS)} onChange={(v) => setTweak("accent", v)} />
        <TweakSelect label="Display font" value={t.displayFont}
          options={["Newsreader", "Spectral", "Fraunces", "Hanken Grotesk"]}
          onChange={(v) => setTweak("displayFont", v)} />
        <TweakSection label="Create tab" />
        <TweakRadio label="Prompt layout" value={t.promptLayout}
          options={["centered", "editorial"]} onChange={(v) => setTweak("promptLayout", v)} />
        <TweakSection label="Library" />
        <TweakRadio label="Course cards" value={t.cardStyle}
          options={["spacious", "compact"]} onChange={(v) => setTweak("cardStyle", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
