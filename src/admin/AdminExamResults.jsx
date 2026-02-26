import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./AdminExamResults.css";

export default function AdminExamResults() {

  const location = useLocation();
  const navigate = useNavigate();

  const examId = location.state?.examId;
  const title = location.state?.title;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) {
      navigate("/admin/dashboard");
      return;
    }
    loadResults();
  }, [examId, navigate]);

  const loadResults = async () => {
    try {
      const q = query(
        collection(db, "results"),
        where("examId", "==", examId)
      );

      const snap = await getDocs(q);

      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setResults(list);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "Unknown";
    if (ts.toDate) return ts.toDate().toLocaleString();
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="results-page">
      <div className="results-container">

        <h2 className="results-title">
          {title || "Exam"} — Results
        </h2>

        {loading && <p>Loading results...</p>}

        {!loading && results.length === 0 && (
          <p className="empty-text">No students have submitted yet.</p>
        )}

        {!loading && results.map(r => (
          <div key={r.id} className="result-card">

            <div className="result-name">
              {r.studentName || "Unknown Student"}
            </div>

            <div className="result-meta">
              Email: {r.email || "—"}
            </div>

            <div className="result-meta">
              Score: {r.score ?? 0} / {r.totalQuestions ?? 0}
            </div>

            <div className="result-meta">
              Submitted: {formatDate(r.submittedAt)}
            </div>

            <Link to={`/admin/student-result/${r.id}`}>
              <button className="result-button">
                View Detailed Result
              </button>
            </Link>

          </div>
        ))}

      </div>
    </div>
  );
}