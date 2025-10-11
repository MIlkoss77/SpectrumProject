import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { EventsAPI } from "../services/events";

const STORAGE_KEY = "spectr.academy.progress";

const COURSES = [
  {
    id: "candlesticks_101",
    title: "How to Read Candlesticks",
    duration: 12,
    badge: "Candle Master",
    lessons: [
      { id: "intro", title: "Structure of a Candle" },
      { id: "patterns", title: "High probability patterns" },
      { id: "practice", title: "Practice quiz" },
    ],
    apply: { indicator: "candles", symbol: "BTCUSDT", timeframe: "4h" },
  },
  {
    id: "momentum_ai",
    title: "Momentum with AI Signals",
    duration: 18,
    badge: null,
    lessons: [
      { id: "rsi", title: "RSI + EMA setup" },
      { id: "divergence", title: "Divergences" },
      { id: "automation", title: "Automate rebalance" },
    ],
    apply: { indicator: "RSI", symbol: "ETHUSDT", timeframe: "1h" },
  },
  {
    id: "risk_gamification",
    title: "Risk Controls & Rebalance",
    duration: 15,
    badge: null,
    lessons: [
      { id: "position", title: "Position sizing" },
      { id: "kelly", title: "Kelly overlays" },
      { id: "alerts", title: "Setting VIP alerts" },
    ],
    apply: { indicator: "Risk", symbol: "SOLUSDT", timeframe: "12h" },
  },
];

export default function Academy() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  const completedCourses = useMemo(() => Object.keys(progress).filter(id => progress[id]?.completed), [progress]);

  const toggleLesson = async (course, lessonId) => {
    const courseProgress = progress[course.id] || { lessons: {}, completed: false, badgeGranted: false };
    const nextLessons = {
      ...courseProgress.lessons,
      [lessonId]: !courseProgress.lessons?.[lessonId],
    };
    const allCompleted = course.lessons.every(item => nextLessons[item.id]);
    const nextState = {
      ...progress,
      [course.id]: {
        lessons: nextLessons,
        completed: allCompleted,
        badgeGranted: courseProgress.badgeGranted || false,
      },
    };
    setProgress(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));

    if (allCompleted && course.badge && !courseProgress.badgeGranted) {
      setSending(true);
      try {
        await EventsAPI.sendGamification({
          event: "course.completed",
          courseId: course.id,
          badge: course.badge,
          userId: "demo_user",
        });
        const updated = {
          ...nextState,
          [course.id]: {
            ...nextState[course.id],
            badgeGranted: true,
          },
        };
        setProgress(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setMessage(t("pages.academy.badgeGranted", { badge: course.badge }));
      } catch (err) {
        console.error(err);
      } finally {
        setSending(false);
      }
    }
  };

  const applyToChart = (course) => {
    const payload = {
      courseId: course.id,
      indicator: course.apply?.indicator,
      symbol: course.apply?.symbol,
      timeframe: course.apply?.timeframe,
      ts: Date.now(),
    };
    sessionStorage.setItem("spectr.academy.apply", JSON.stringify(payload));
    navigate(`/signals?course=${course.id}`);
  };

  return (
    <section className="page" style={{ display: "grid", gap: 16 }}>
      <h1 className="page-title">{t("pages.academy.title")}</h1>

      {message && (
        <div className="card" style={{ borderColor: "var(--good)", color: "var(--good)" }}>
          {message}
        </div>
      )}

      <div className="card" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{completedCourses.length}</div>
          <div style={{ color: "var(--muted)" }}>{t("pages.academy.completed")}</div>
        </div>
        <div style={{ color: "var(--muted)" }}>
          {t("pages.academy.hint")}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {COURSES.map(course => {
          const state = progress[course.id] || { lessons: {}, completed: false, badgeGranted: false };
          const completed = course.lessons.filter(item => state.lessons?.[item.id]).length;
          const total = course.lessons.length;
          return (
            <div key={course.id} className="card" style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{course.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    {t("pages.academy.duration", { minutes: course.duration })}
                    {course.badge ? ` · ${t("pages.academy.badge", { badge: course.badge })}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>
                    {t("pages.academy.progress", { completed, total })}
                  </span>
                  <button className="btn" onClick={() => applyToChart(course)}>
                    {t("pages.academy.apply")}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {course.lessons.map(lesson => (
                  <label key={lesson.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={!!state.lessons?.[lesson.id]}
                      onChange={() => toggleLesson(course, lesson.id)}
                      disabled={sending}
                    />
                    <span>{lesson.title}</span>
                  </label>
                ))}
              </div>

              {state.completed && (
                <div style={{ color: "var(--good)", fontSize: 13 }}>
                  {course.badge && state.badgeGranted
                    ? t("pages.academy.badgeReady", { badge: course.badge })
                    : t("pages.academy.courseDone")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
