// CreateTab.jsx — the "prompt the AI" intake screen
const { useState } = React;

const DEPTHS = [
  { id: "shallow", label: "Shallow", note: "the gist, fast" },
  { id: "standard", label: "Standard", note: "solid working grasp" },
  { id: "deep", label: "Deep", note: "thorough mastery" },
];
const MODES = [
  { id: "new", label: "New subject", note: "Placement check, full course from fundamentals, final exam." },
  { id: "review", label: "Review", note: "Find your gaps, condensed and techniques-first." },
  { id: "quick", label: "Quick / casual", note: "Short and efficient. No exams." },
];

function Stepper({ value, set, min, max, step = 1, suffix }) {
  return (
    <div className="stepper">
      <button onClick={() => set(Math.max(min, value - step))} aria-label="decrease">–</button>
      <span className="val">{value}{suffix ? <span style={{ fontWeight: 400, color: "var(--ink-3)", fontSize: 12 }}>{suffix}</span> : null}</span>
      <button onClick={() => set(Math.min(max, value + step))} aria-label="increase">+</button>
    </div>
  );
}

function IntakeControls({ s, set, showModes }) {
  const [adv, setAdv] = useState(false);
  const totalSessions = s.weeks * s.perWeek;
  const totalHours = Math.round((totalSessions * s.minutes) / 6) / 10;
  return (
    <div className="intake-controls">
      <div className="ctl-block">
        <label className="field-label">Depth</label>
        <div className="seg">
          {DEPTHS.map((d) => (
            <button key={d.id} className={"seg-btn" + (s.depth === d.id ? " on" : "")} onClick={() => set({ depth: d.id })}>{d.label}</button>
          ))}
        </div>
        <p className="ctl-note">{DEPTHS.find((d) => d.id === s.depth).note}</p>
      </div>

      <div className="ctl-block">
        <label className="field-label">Time budget</label>
        <div className="budget-grid">
          <div className="budget-cell">
            <Stepper value={s.weeks} set={(v) => set({ weeks: v })} min={1} max={26} />
            <span className="budget-unit">weeks</span>
          </div>
          <span className="budget-x">×</span>
          <div className="budget-cell">
            <Stepper value={s.perWeek} set={(v) => set({ perWeek: v })} min={1} max={7} />
            <span className="budget-unit">/ week</span>
          </div>
          <span className="budget-x">×</span>
          <div className="budget-cell">
            <Stepper value={s.minutes} set={(v) => set({ minutes: v })} min={10} max={120} step={5} />
            <span className="budget-unit">min</span>
          </div>
        </div>
        <p className="ctl-note">≈ {totalSessions} sessions · about {totalHours} hours total</p>
      </div>

      <button className="adv-toggle" onClick={() => setAdv(!adv)}>
        <span className={"adv-caret" + (adv ? " open" : "")}>›</span>
        Advanced — mode &amp; deadline
      </button>

      {adv && (
        <div className="adv-panel fade-in">
          <div className="ctl-block">
            <label className="field-label">Mode</label>
            <div className="mode-list">
              {MODES.map((m) => (
                <button key={m.id} className={"mode-row" + (s.mode === m.id ? " on" : "")} onClick={() => set({ mode: m.id })}>
                  <span className="mode-radio" />
                  <span>
                    <span className="mode-name">{m.label}</span>
                    <span className="mode-note">{m.note}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="ctl-block">
            <label className="field-label">Hard deadline (optional)</label>
            <input className="input" type="date" value={s.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} style={{ maxWidth: 220 }} />
            <p className="ctl-note">If set, the schedule compresses to land before this date.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateTab({ onGenerate, layout }) {
  const [s, setS] = useState({
    subject: "",
    depth: "standard",
    mode: "new",
    weeks: 6,
    perWeek: 3,
    minutes: 30,
    deadline: null,
  });
  const set = (patch) => setS((p) => ({ ...p, ...patch }));
  const canGo = s.subject.trim().length > 1;
  const go = () => { if (canGo) onGenerate({ ...s }); };

  const promptField = (
    <div className="prompt-field">
      <label className="field-label">I want to learn…</label>
      <textarea
        className="textarea prompt-input"
        rows={layout === "editorial" ? 2 : 2}
        placeholder="e.g. Investing — I want to understand how to build a long-term portfolio"
        value={s.subject}
        onChange={(e) => set({ subject: e.target.value })}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) go(); }}
      />
      <div className="suggest-row">
        <span className="mono" style={{ marginRight: 4 }}>Try</span>
        {["Investing", "Music theory", "Statistics", "French cooking"].map((x) => (
          <button key={x} className="suggest-chip" onClick={() => set({ subject: x })}>{x}</button>
        ))}
      </div>
    </div>
  );

  if (layout === "editorial") {
    return (
      <div className="create-editorial fade-in">
        <div className="ce-left">
          <p className="mono">New course</p>
          <h1 className="ce-title">Tell me what you<br />want to learn.</h1>
          <p className="ce-lede">
            I'll build a structured, time-boxed curriculum that fits your schedule —
            a placement check, lessons with quizzes, and a final exam. Not a chatbot,
            not a rigid course. Something in between, shaped to you.
          </p>
          <div className="ce-steps">
            <div className="ce-step"><span className="ce-num">1</span> You set the subject &amp; time</div>
            <div className="ce-step"><span className="ce-num">2</span> I place you and plan a schedule</div>
            <div className="ce-step"><span className="ce-num">3</span> You learn, lesson by lesson</div>
          </div>
        </div>
        <div className="ce-right card-panel">
          {promptField}
          <IntakeControls s={s} set={set} />
          <div className="intake-actions">
            <button className="btn btn-primary" disabled={!canGo} onClick={go}>Generate course →</button>
            <span className="kbd-hint">⌘↵</span>
          </div>
        </div>
      </div>
    );
  }

  // default: centered
  return (
    <div className="create-centered fade-in">
      <p className="mono cc-kicker">New course</p>
      <h1 className="cc-title">What do you want to learn?</h1>
      <p className="cc-sub">A curriculum built to your subject, depth, and the time you actually have.</p>
      <div className="cc-card card-panel">
        {promptField}
        <div className="cc-divider" />
        <IntakeControls s={s} set={set} />
        <div className="intake-actions">
          <button className="btn btn-primary" disabled={!canGo} onClick={go}>Generate course →</button>
          <span className="kbd-hint">⌘↵ to generate</span>
        </div>
      </div>
    </div>
  );
}

window.CreateTab = CreateTab;
