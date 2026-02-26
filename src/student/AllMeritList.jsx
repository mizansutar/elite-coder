import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function AllMeritList() {

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadResults = async () => {

      try {

        const snap = await getDocs(collection(db, "results"));

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Global sort
        data.sort((a, b) => {

          const scoreDiff = (b.score || 0) - (a.score || 0);
          if (scoreDiff !== 0) return scoreDiff;

          return (a.durationSeconds || 0) - (b.durationSeconds || 0);
        });

        setResults(data);

      } catch (err) {
        console.error("Error loading merit list:", err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();

  }, []);

  if (loading)
    return <div style={{ padding: 30 }}>Loading merit list...</div>;

  if (results.length === 0)
    return <div style={{ padding: 30 }}>No results found.</div>;

  return (
    <div style={{ padding: 30 }}>

      <h2>🏆 Global Merit List (All Exams)</h2>

      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Exam ID</th>
            <th>Score</th>
            <th>Accuracy</th>
            <th>Time (sec)</th>
          </tr>
        </thead>

        <tbody>
          {results.map((r, index) => {

            const rank = index + 1;

            return (
              <tr key={r.id}>
                <td>
                  {rank === 1 ? "🥇" :
                   rank === 2 ? "🥈" :
                   rank === 3 ? "🥉" :
                   rank}
                </td>
                <td>{r.studentName}</td>
                <td>{r.examId}</td>
                <td>{r.score} / {r.totalQuestions}</td>
                <td>{r.accuracy}%</td>
                <td>{r.durationSeconds}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
}