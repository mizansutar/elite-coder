import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Quiz.css";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

export default function Quiz() {

  const navigate = useNavigate();
  const location = useLocation();
  const { examId, student } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);

  const startTimeRef = useRef(null);
  const submitLockRef = useRef(false);

  // ---------- SUBMIT ----------
  const submitExam = async (reason = "Submitted") => {

    if (!attemptId || !examId) return;
    if (submitLockRef.current || submitted || submitting) return;

    submitLockRef.current = true;
    setSubmitting(true);

    try {

      const examSnap = await getDoc(doc(db, "exams", examId));
      const exam = examSnap.data();
      if (!exam) return;

      const setSnap = await getDoc(doc(db, "questionSets", exam.questionSetId));
      const qs = setSnap.data()?.questions || [];

      let score = 0;
      qs.forEach((q, i) => {
        if (answers[i] === q.correct) score++;
      });

      const now = new Date();
      const durationSeconds =
        Math.floor((now - startTimeRef.current) / 1000);

      await addDoc(collection(db, "results"), {
        examId,
        studentName: student.name,
        email: student.email,
        answers,
        score,
        totalQuestions: qs.length,
        accuracy: qs.length
          ? Math.round((score / qs.length) * 100)
          : 0,
        durationSeconds,
        reason,
        submittedAt: now
      });

      await updateDoc(doc(db, "attempts", attemptId), {
        status: "submitted",
        submittedAt: now
      });

      setSubmitted(true);
      navigate("/result");

    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- VIOLATION ----------
  const handleViolation = async (reason) => {

    if (submitLockRef.current || !attemptId || submitted) return;

    try {
      await updateDoc(doc(db, "attempts", attemptId), {
        violation: reason,
        violationAt: new Date()
      });
    } catch {}

    submitExam(reason);
  };

  // ---------- LOAD ----------
  useEffect(() => {

    if (!examId || !student) {
      navigate("/");
      return;
    }

    const load = async () => {

      try {

        const examSnap = await getDoc(doc(db, "exams", examId));
        const exam = examSnap.data();
        if (!exam) return;

        setEndTime(exam.autoEndTime?.toDate());

        const setSnap = await getDoc(doc(db, "questionSets", exam.questionSetId));
        setQuestions(setSnap.data()?.questions || []);

        const qAttempt = query(
          collection(db, "attempts"),
          where("examId", "==", examId),
          where("email", "==", student.email)
        );

        const snap = await getDocs(qAttempt);

        if (!snap.empty) {
          const d = snap.docs[0];
          const data = d.data();

          setAttemptId(d.id);
          setAnswers(data.answers || {});
          startTimeRef.current =
            data.startedAt?.toDate?.() || new Date();

          setLoading(false);
          return;
        }

        const now = new Date();

        const attemptRef = await addDoc(collection(db, "attempts"), {
          examId,
          email: student.email,
          studentName: student.name,
          startedAt: now,
          status: "in-progress",
          answers: {}
        });

        startTimeRef.current = now;
        setAttemptId(attemptRef.id);
        setLoading(false);

      } catch (err) {
        console.error(err);
      }
    };

    load();

  }, [examId, student, navigate]);

  // ---------- TIMER ----------
  useEffect(() => {

    if (!endTime || submitted) return;

    const tick = () => {
      const diff = Math.floor((endTime - new Date()) / 1000);

      if (diff <= 0) submitExam("Time ended");
      else setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);

  }, [endTime, submitted]);

  // ---------- ADMIN CLOSE ----------
  useEffect(() => {

    if (!examId || submitted) return;

    const unsub = onSnapshot(doc(db, "exams", examId), snap => {
      if (snap.exists() && snap.data()?.status === "closed") {
        handleViolation("Closed by admin");
      }
    });

    return () => unsub();

  }, [examId, submitted]);

  // ---------- TAB SWITCH ----------
  useEffect(() => {

    const blur = () => handleViolation("Left exam window");
    const hidden = () => {
      if (document.hidden) handleViolation("Switched tab");
    };

    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", hidden);

    return () => {
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", hidden);
    };

  }, [attemptId, submitted]);

  // ---------- OFFLINE ----------
  useEffect(() => {

    const offline = () =>
      handleViolation("Network disconnected");

    window.addEventListener("offline", offline);
    return () =>
      window.removeEventListener("offline", offline);

  }, [attemptId, submitted]);

  // ---------- AUTOSAVE (SAFE VERSION) ----------
  useEffect(() => {

    if (!attemptId || submitted) return;

    const timeout = setTimeout(async () => {
      try {
        await updateDoc(doc(db, "attempts", attemptId), {
          answers,
          lastSaved: new Date()
        });
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    }, 1500);

    return () => clearTimeout(timeout);

  }, [answers, attemptId, submitted]);

  const selectAnswer = (i, opt) =>
    setAnswers(prev => ({ ...prev, [i]: opt }));

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) return <div className="loading">Loading exam…</div>;

  return (
    <div className="quiz-page">

      <div className="timer-bar">⏱ {formatTime()}</div>

      <div className="quiz-container">

        <div style={{ marginBottom: 20 }}>
          <div><strong>Name:</strong> {student.name}</div>
          <div><strong>Email:</strong> {student.email}</div>
        </div>

        {questions.map((q, i) => (
          <div key={i} className="question">
            <p>{i + 1}. {q.text}</p>

            {["A","B","C","D"].map(opt => (
              <label key={opt}>
                <input
                  type="radio"
                  name={`q${i}`}
                  checked={answers[i] === opt}
                  onChange={() => selectAnswer(i, opt)}
                />
                {q[opt]}
              </label>
            ))}
          </div>
        ))}

        <button
          disabled={submitting || submitted}
          onClick={() => submitExam()}
        >
          {submitting ? "Submitting…" : "Submit Exam"}
        </button>

      </div>
    </div>
  );
}