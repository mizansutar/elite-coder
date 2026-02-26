import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./Register.css";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

export default function Register() {

  const navigate = useNavigate();
  const unsubscribeRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [key, setKey] = useState("");

  const [waiting, setWaiting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const startExam = async () => {

    if (loading) return;

    if (!name.trim() || !email.trim() || !key.trim()) {
      setMessage("Please fill all fields");
      return;
    }

    try {

      setLoading(true);
      setMessage("Checking exam…");

      const emailLower = email.trim().toLowerCase();

      const qExam = query(collection(db, "exams"), where("examKey", "==", key));
      const examSnap = await getDocs(qExam);

      if (examSnap.empty) {
        setMessage("Invalid exam key");
        setLoading(false);
        return;
      }

      const examDoc = examSnap.docs[0];
      const examId = examDoc.id;
      const examData = examDoc.data();

      if (examData.status === "closed") {
        setMessage("Exam is closed");
        setLoading(false);
        return;
      }

      // prevent duplicate student record
      const qStudent = query(
        collection(db, "students"),
        where("examId", "==", examId),
        where("email", "==", emailLower)
      );

      const studentSnap = await getDocs(qStudent);

      if (studentSnap.empty) {
        await addDoc(collection(db, "students"), {
          name,
          email: emailLower,
          examId,
          joinedAt: new Date()
        });
      }

      setWaiting(true);
      setMessage("Waiting for exam to start…");

      unsubscribeRef.current = onSnapshot(doc(db, "exams", examId), snap => {

        const exam = snap.data();

        if (exam?.status === "active") {
          unsubscribeRef.current();
          navigate("/quiz", {
            state: { examId, student: { name, email: emailLower } }
          });
        }

        if (exam?.status === "closed") {
          setMessage("Exam closed by administrator");
        }

      });

    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="register-page">
      <div className="register-card">

        <h2>Exam Registration</h2>

        {!waiting && (
          <>
            <input
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              placeholder="Exam Key"
              value={key}
              onChange={e => setKey(e.target.value)}
            />

            <button onClick={startExam} disabled={loading}>
              {loading ? "Checking…" : "Register"}
            </button>
          </>
        )}

        {waiting && (
          <div style={{ marginTop: 20 }}>
            <p>{message}</p>
            <p>Please wait…</p>
          </div>
        )}

        {!waiting && message && (
          <p style={{ marginTop: 12, color: "red" }}>{message}</p>
        )}

      </div>
    </div>
  );
}