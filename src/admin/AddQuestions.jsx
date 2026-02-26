import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddQuestions.css";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function AddQuestions() {

  const navigate = useNavigate();

  const createEmptyQuestion = () => ({
    text: "",
    A: "",
    B: "",
    C: "",
    D: "",
    correct: "" // ← no default
  });

  const [setNumber, setSetNumber] = useState("");
  const [questions, setQuestions] = useState(
    Array.from({ length: 25 }, createEmptyQuestion)
  );
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (index, field, value) => {
    setQuestions(prev =>
      prev.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    );
  };

  const validate = () => {
    if (!setNumber.trim()) return "Enter set number";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.text || !q.A || !q.B || !q.C || !q.D) {
        return `Question ${i + 1} is incomplete`;
      }

      if (!q.correct) {
        return `Select correct answer for Question ${i + 1}`;
      }
    }

    return "";
  };

  const saveSet = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "questionSets"), {
        setNumber,
        questions,
        createdAt: serverTimestamp()
      });

      setShowDialog(true);
    } catch (err) {
      setError("Failed to save set");
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    navigate("/admin/dashboard");
  };

  return (
    <div className="exam-builder">

      <h2>Create Question Set</h2>

      <input
        className="set-input"
        placeholder="Set Number"
        value={setNumber}
        onChange={e => setSetNumber(e.target.value)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {questions.map((q, i) => (
        <div key={i} className="question-block">

          <h4>Question {i + 1}</h4>

          <textarea
            value={q.text}
            placeholder="Enter question"
            onChange={e => handleChange(i, "text", e.target.value)}
          />

          <input value={q.A} placeholder="Option A" onChange={e => handleChange(i,"A",e.target.value)} />
          <input value={q.B} placeholder="Option B" onChange={e => handleChange(i,"B",e.target.value)} />
          <input value={q.C} placeholder="Option C" onChange={e => handleChange(i,"C",e.target.value)} />
          <input value={q.D} placeholder="Option D" onChange={e => handleChange(i,"D",e.target.value)} />

          <select
            value={q.correct}
            onChange={e => handleChange(i,"correct",e.target.value)}
          >
            <option value="">Select correct answer</option>
            <option value="A">Correct: A</option>
            <option value="B">Correct: B</option>
            <option value="C">Correct: C</option>
            <option value="D">Correct: D</option>
          </select>

        </div>
      ))}

      <button className="save-btn" onClick={saveSet} disabled={loading}>
        {loading ? "Saving..." : "Save Question Set"}
      </button>

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Question Set Saved</h3>
            <button onClick={closeDialog}>Go to Dashboard</button>
          </div>
        </div>
      )}

    </div>
  );
}