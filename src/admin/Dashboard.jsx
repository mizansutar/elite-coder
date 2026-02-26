import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

import { collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Dashboard() {

  const [exams, setExams] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchExams();
  }, []);

  // tick every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // auto close checker
  useEffect(() => {
    const interval = setInterval(checkAutoClose, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchExams = async () => {
    const snapshot = await getDocs(collection(db, "exams"));
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    setExams(list);
  };

  const startExam = async (id) => {
    const start = new Date();
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    await updateDoc(doc(db, "exams", id), {
      status: "active",
      startTime: Timestamp.fromDate(start),
      autoEndTime: Timestamp.fromDate(end)
    });

    fetchExams();
  };

  const endExam = async (id) => {
    await updateDoc(doc(db, "exams", id), {
      status: "closed"
    });
    fetchExams();
  };

  const checkAutoClose = async () => {
    const snapshot = await getDocs(collection(db, "exams"));

    snapshot.docs.forEach(async d => {
      const exam = d.data();

      if (
        exam.status === "active" &&
        exam.autoEndTime &&
        exam.autoEndTime.toDate() <= new Date()
      ) {
        await updateDoc(doc(db, "exams", d.id), {
          status: "closed"
        });
      }
    });

    fetchExams();
  };

  const formatRemaining = (autoEndTime) => {
    if (!autoEndTime) return "";

    const diff = autoEndTime.toDate() - now;

    if (diff <= 0) return "Closing…";

    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return `${m}m ${s}s`;
  };

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <h2>Exam Management</h2>

        <div className="nav-buttons">
          <Link to="/admin/create-exam">Create Exam</Link>
          <Link to="/admin/add-questions">Question Sets</Link>
        </div>
      </header>

      <div className="exam-list">

        {exams.map(exam => (
          <div key={exam.id} className="exam-card">

            <div className="exam-info">
              <h3>{exam.title}</h3>
              <p>Key: {exam.examKey}</p>
              <span className={`status ${exam.status}`}>
                {exam.status}
              </span>
            </div>

            <div className="exam-actions">

              <button
                disabled={exam.status === "active"}
                onClick={() => startExam(exam.id)}
              >
                Start
              </button>

              <button
                disabled={exam.status !== "active"}
                onClick={() => endExam(exam.id)}
              >
                End
              </button>

              <Link
                to="/admin/exam-results"
                state={{ examId: exam.id, title: exam.title }}
              >
                <button>View Results</button>
              </Link>

              {exam.status === "active" && exam.autoEndTime && (
                <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>
                  Closes in: {formatRemaining(exam.autoEndTime)}
                </div>
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}