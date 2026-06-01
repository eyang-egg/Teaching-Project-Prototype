// LibraryTab.jsx — browse courses → modules → lessons
const { useState: useStateLib, useEffect: useEffectLib } = React;

const MODE_LABEL = { new: "New subject", review: "Review", quick: "Quick" };

function ProgressRing({ pct, size = 38 }) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  const done = pct >= 100;
  return (
    <svg width={size} height={size} className="ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-sunk)" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={done ? "var(--good)" : "var(--accent)"} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.7,.3,1)" }}
      />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle"
        style={{ font: "600 11px var(--mono)", fill: done ? "var(--good)" : "var(--ink-2)" }}>
        {done ? "✓" : Math.round(pct)}
      </text>
    </svg>
  );
}

function LessonRow({ lesson, onOpen }) {
  const done = lesson.status === "completed";
  return (
    <button className="lesson-row" onClick={() => onOpen(lesson)}>
      <span className={"lesson-check" + (done ? " done" : "")}>{done ? "✓" : ""}</span>
      <span className={"lesson-title" + (done ? " done" : "")}>{lesson.title}</span>
      <span className="lesson-meta">
        {lesson.hasQuiz && <span className="lesson-quiz">quiz</span>}
        <span className="lesson-open">Open →</span>
      </span>
    </button>
  );
}

function ExamRow({ kind }) {
  const isFinal = kind === "final";
  return (
    <div className="exam-row">
      <span className="exam-icon">{isFinal ? "★" : "◇"}</span>
      <span className="exam-title">{isFinal ? "Final exam" : "Placement exam"}</span>
      <span className="exam-tag mono">{isFinal ? "pass / fail" : "before we start"}</span>
    </div>
  );
}

function CourseCard({ course, expanded, onToggle, onOpenLesson, isNew, compact }) {
  const pct = course.totalLessons ? (course.completedLessons / course.totalLessons) * 100 : 0;
  const done = course.status === "completed";
  return (
    <div className={"course-card" + (expanded ? " open" : "") + (isNew ? " is-new" : "") + (compact ? " compact" : "")}>
      <button className="course-head" onClick={onToggle}>
        <div className="course-head-main">
          {!compact && <ProgressRing pct={pct} />}
          <div className="course-headings">
            <div className="course-title-row">
              <h3 className="course-title">{course.subject}</h3>
            </div>
            <div className="course-meta-row">
              {isNew && <span className="pill accent">just generated</span>}
              {done && <span className="pill good">completed</span>}
              <span className="pill">{MODE_LABEL[course.mode]}</span>
              <span className="course-dot">·</span>
              <span>{course.depth}</span>
              <span className="course-dot">·</span>
              <span>{course.weeks} wks · {course.perWeek}×/wk · {course.minutes}m</span>
              <span className="course-dot">·</span>
              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
            </div>
          </div>
        </div>
        <div className="course-head-right">
          {compact && (
            <div className="compact-prog">
              <div className="bar" style={{ width: 90 }}><span style={{ width: pct + "%" }} /></div>
            </div>
          )}
          <span className={"chevron" + (expanded ? " open" : "")}>›</span>
        </div>
      </button>

      {expanded && (
        <div className="course-body fade-in">
          {course.hasPlacement && <ExamRow kind="placement" />}
          {course.modules.map((m, i) => (
            <div className="module" key={m.id}>
              <div className="module-head">
                <span className="module-num mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="module-title">{m.title}</span>
                <span className="module-count mono">{m.lessons.length} lessons</span>
              </div>
              <div className="module-lessons">
                {m.lessons.map((l) => <LessonRow key={l.id} lesson={l} onOpen={onOpenLesson} />)}
              </div>
            </div>
          ))}
          {course.hasFinal && <ExamRow kind="final" />}
        </div>
      )}
    </div>
  );
}

function LibraryTab({ courses, onOpenLesson, openId, setOpenId, newCourseId, cardStyle, goCreate }) {
  const compact = cardStyle === "compact";

  if (!courses.length) {
    return (
      <div className="lib-empty fade-in">
        <div className="empty-mark" />
        <h2 className="empty-title serif">No courses yet</h2>
        <p className="empty-sub">Generate your first curriculum and it will live here, ready to pick up anytime.</p>
        <button className="btn btn-primary" onClick={goCreate}>Create a course →</button>
      </div>
    );
  }

  const active = courses.filter((c) => c.status !== "completed");
  const finished = courses.filter((c) => c.status === "completed");

  const renderGroup = (list) => list.map((c) => (
    <CourseCard
      key={c.id}
      course={c}
      expanded={openId === c.id}
      onToggle={() => setOpenId(openId === c.id ? null : c.id)}
      onOpenLesson={(l) => onOpenLesson(c, l)}
      isNew={c.id === newCourseId}
      compact={compact}
    />
  ));

  return (
    <div className="library fade-in">
      <div className="lib-head">
        <h1 className="lib-title serif">Your library</h1>
        <p className="lib-sub">{active.length} in progress · {finished.length} completed</p>
      </div>

      {active.length > 0 && (
        <section className="lib-section">
          <h2 className="lib-section-label mono">In progress</h2>
          <div className="course-list">{renderGroup(active)}</div>
        </section>
      )}

      {finished.length > 0 && (
        <section className="lib-section">
          <h2 className="lib-section-label mono">Completed</h2>
          <div className="course-list">{renderGroup(finished)}</div>
        </section>
      )}
    </div>
  );
}

window.LibraryTab = LibraryTab;
