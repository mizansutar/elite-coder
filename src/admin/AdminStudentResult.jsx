import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminStudentResult() {

  const { id } = useParams();

  const [result, setResult] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const load = async () => {

      try {

        const resultSnap = await getDoc(doc(db, "results", id));

        if (!resultSnap.exists()) {
          setError("Result not found");
          setLoading(false);
          return;
        }

        const res = resultSnap.data();
        setResult(res);

        const examSnap = await getDoc(doc(db, "exams", res.examId));

        if (!examSnap.exists()) {
          setError("Exam not found");
          setLoading(false);
          return;
        }

        const ex = examSnap.data();
        setExam(ex);

        const setSnap = await getDoc(doc(db, "questionSets", ex.questionSetId));
        setQuestions(setSnap.data()?.questions || []);

      } catch (err) {
        console.error(err);
        setError("Load failed");
      }

      setLoading(false);
    };

    if (id) load();

  }, [id]);

  if (loading) return <div style={{ padding: 30 }}>Loading…</div>;
  if (error) return <div style={{ padding: 30, color: "red" }}>{error}</div>;

  // calculate score
  const total = questions.length;

  const correctCount = questions.reduce((acc, q, i) => {
    return acc + (result.answers?.[i] === q.correct ? 1 : 0);
  }, 0);

  const wrongCount = total - correctCount;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;

  const submittedTime = result.submittedAt?.toDate
    ? result.submittedAt.toDate().toLocaleString()
    : "Unknown";

  return (
    <div style={{ padding: 30 }}>

      <h2>Student Result Report</h2>

      {/* summary */}
      <div style={{
        marginBottom: 20,
        padding: 15,
        border: "1px solid #ddd",
        background: "#f9fafb"
      }}>
        <p><strong>Name:</strong> {result.studentName}</p>
        <p><strong>Email:</strong> {result.email}</p>
        <p><strong>Exam ID:</strong> {result.examId}</p>
        <p><strong>Exam Key:</strong> {exam.examKey}</p>
        <p><strong>Submitted:</strong> {submittedTime}</p>
        <p><strong>Status:</strong> {result.reason}</p>

        <hr />

        <p><strong>Score:</strong> {correctCount} / {total}</p>
        <p><strong>Correct:</strong> {correctCount}</p>
        <p><strong>Wrong:</strong> {wrongCount}</p>
        <p><strong>Accuracy:</strong> {accuracy}%</p>
      </div>

      {/* answers */}
      {questions.map((q, i) => {

        const selected = result.answers?.[i];
        const correct = q.correct;
        const isCorrect = selected === correct;

        return (
          <div key={i} style={{
            marginBottom: 20,
            padding: 15,
            border: "1px solid #ddd",
            background: isCorrect ? "#f0fdf4" : "#fef2f2"
          }}>
            <p><strong>{i + 1}. {q.text}</strong></p>
            <p>Selected: {selected || "—"}</p>
            <p>Correct: {correct}</p>
          </div>
        );
      })}

    </div>
  );
}