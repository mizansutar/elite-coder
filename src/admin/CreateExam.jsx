import { useState, useEffect } from "react";
import "./CreateExam.css";

import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function CreateExam() {

  const [title, setTitle] = useState("");
  const [examKey, setExamKey] = useState("");
  const [setSelected, setSetSelected] = useState("");
  const [sets, setSets] = useState([]);

  useEffect(() => {
    const fetchSets = async () => {
      const snapshot = await getDocs(collection(db, "questionSets"));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSets(list);
    };

    fetchSets();
  }, []);

  const handleCreate = async () => {

    if (!title || !examKey || !setSelected) {
      alert("Fill all fields");
      return;
    }

    try {

      const exam = {
        title,
        examKey,
        questionSetId: setSelected,
        status: "scheduled", // waiting for admin start
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "exams"), exam);

      alert("Exam created successfully");

      setTitle("");
      setExamKey("");
      setSetSelected("");

    } catch (err) {
      console.error(err);
      alert("Error creating exam");
    }
  };

  return (
    <div className="exam-builder">

      <h2>Create Exam</h2>

      <div className="form-group">
        <label>Exam Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Exam Key</label>
        <input
          value={examKey}
          onChange={e => setExamKey(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Question Set</label>
        <select
          value={setSelected}
          onChange={e => setSetSelected(e.target.value)}
        >
          <option value="">Select Set</option>
          {sets.map(set => (
            <option key={set.id} value={set.id}>
              {set.setNumber}
            </option>
          ))}
        </select>
      </div>

      <button className="schedule-btn" onClick={handleCreate}>
        Create Exam
      </button>

    </div>
  );
}