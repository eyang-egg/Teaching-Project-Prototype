// LessonPlayer.jsx — slide-up lesson reader with figure + interactive quiz
const { useState: useStateLP, useEffect: useEffectLP, useMemo: useMemoLP } = React;

// Build believable generic content for any lesson that has no bespoke content.
function genContent(title) {
  return {
    estMin: 7 + (title.length % 5),
    sections: [
      { kind: "prose", heading: "The idea", body:
        `“${title}” is one of the abilities this topic is built around. Before the details, hold the shape of it: ` +
        `what problem it solves, where it shows up, and how you'll know you've got it. We build from that frame outward.` },
      { kind: "callout", label: "Why it matters", body:
        `Skip this and the next lessons get shaky. Internalize it and the rest of the topic clicks into place far faster.` },
      { kind: "prose", heading: "How it works", body:
        `We walk it in plain language first, then a worked example, then the edges where people usually trip. ` +
        `The goal isn't to memorize — it's to be able to reproduce the reasoning on your own afterward.` },
      { kind: "figure", caption: "Where this sits in your progress", data: [
        { label: "Already covered", v: 60 },
        { label: "This lesson", v: 85 },
        { label: "Still ahead", v: 40 },
      ] },
      { kind: "prose", heading: "Make it stick", body:
        `A short practice problem follows. Remember: the tutor gives graduated hints, never the answer outright — ` +
        `the struggle is where the learning actually happens.` },
    ],
    quiz: {
      prompt: "Quick check",
      questions: [
        { q: `In your own framing, the point of “${title}” is mostly about…`,
          options: ["Memorizing terms", "Building reusable reasoning", "Passing the final only", "Going as fast as possible"], answer: 1 },
      ],
    },
  };
}

function Figure({ caption, data }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <figure className="lp-figure">
      <div className="lp-bars">
        {data.map((d, i) => (
          <div className="lp-bar-row" key={i}>
            <span className="lp-bar-label">{d.label}</span>
            <div className="lp-bar-track">
              <div className="lp-bar-fill" style={{ width: (d.v / max) * 100 + "%", animationDelay: i * 90 + "ms" }} />
            </div>
            <span className="lp-bar-val">{d.v}</span>
          </div>
        ))}
      </div>
      <figcaption className="lp-cap">{caption}</figcaption>
    </figure>
  );
}

function Quiz({ quiz, onComplete, completed }) {
  const [picks, setPicks] = useStateLP({});
  const [checked, setChecked] = useStateLP(false);
  const allAnswered = quiz.questions.every((_, i) => picks[i] != null);
  const correct = quiz.questions.filter((q, i) => picks[i] === q.answer).length;

  return (
    <div className="lp-quiz">
      <div className="lp-quiz-head">
        <span className="lp-quiz-icon">◇</span>
        <span className="lp-quiz-title">{quiz.prompt}</span>
        {checked && <span className="lp-quiz-score mono">{correct}/{quiz.questions.length} correct</span>}
      </div>
      {quiz.questions.map((q, qi) => (
        <div className="lp-q" key={qi}>
          <p className="lp-q-text">{q.q}</p>
          <div className="lp-options">
            {q.options.map((opt, oi) => {
              const picked = picks[qi] === oi;
              const isAns = q.answer === oi;
              let cls = "lp-opt";
              if (checked) {
                if (isAns) cls += " correct";
                else if (picked) cls += " wrong";
              } else if (picked) cls += " picked";
              return (
                <button key={oi} className={cls} disabled={checked}
                  onClick={() => setPicks((p) => ({ ...p, [qi]: oi }))}>
                  <span className="lp-opt-mark" />
                  <span>{opt}</span>
                  {checked && isAns && <span className="lp-opt-flag">✓</span>}
                  {checked && picked && !isAns && <span className="lp-opt-flag">✕</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="lp-quiz-actions">
        {!checked ? (
          <button className="btn btn-ghost" disabled={!allAnswered} onClick={() => setChecked(true)}>Check answers</button>
        ) : (
          <button className="btn btn-primary" onClick={onComplete}>
            {completed ? "Done ✓" : "Mark lesson complete →"}
          </button>
        )}
        <button className="btn btn-quiet lp-hint-btn">Need a hint?</button>
      </div>
    </div>
  );
}

function LessonPlayer({ ctx, onClose, onComplete }) {
  const { course, lesson } = ctx;
  const content = useMemoLP(() => lesson.content || genContent(lesson.title), [lesson.id]);
  const [reveal, setReveal] = useStateLP(0);

  useEffectLP(() => {
    setReveal(0);
    let n = 0;
    const t = setInterval(() => { n++; setReveal(n); if (n >= content.sections.length) clearInterval(t); }, 120);
    return () => clearInterval(t);
  }, [lesson.id]);

  useEffectLP(() => {
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const idx = (() => {
    let n = 0;
    for (const m of course.modules) for (const l of m.lessons) { n++; if (l.id === lesson.id) return n; }
    return 1;
  })();

  return (
    <div className="lp-overlay" onClick={onClose}>
      <div className="lp-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="lp-bar-top">
          <div className="lp-crumbs mono">
            {course.subject} <span className="lp-crumb-sep">/</span> Lesson {String(idx).padStart(2, "0")}
          </div>
          <button className="lp-close" onClick={onClose} aria-label="close">✕</button>
        </div>
        <div className="lp-scroll">
          <header className="lp-header">
            <p className="mono">{content.estMin} min read · quiz at the end</p>
            <h1 className="lp-title serif">{lesson.title}</h1>
          </header>
          <article className="lp-article">
            {content.sections.map((sec, i) => (
              <div key={i} className={"lp-sec" + (i < reveal ? " in" : "")}>
                {sec.kind === "prose" && (<>
                  <h2 className="lp-h2 serif">{sec.heading}</h2>
                  <p className="lp-p">{sec.body}</p>
                </>)}
                {sec.kind === "callout" && (
                  <aside className="lp-callout">
                    <span className="lp-callout-label mono">{sec.label}</span>
                    <p>{sec.body}</p>
                  </aside>
                )}
                {sec.kind === "figure" && <Figure caption={sec.caption} data={sec.data} />}
              </div>
            ))}
          </article>
          {content.quiz && (
            <Quiz quiz={content.quiz} completed={lesson.status === "completed"}
              onComplete={() => { onComplete(course, lesson); onClose(); }} />
          )}
        </div>
      </div>
    </div>
  );
}

window.LessonPlayer = LessonPlayer;
