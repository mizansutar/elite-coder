import "./Result.css";

export default function Result() {
  return (
    <div className="result-container">
      <div className="result-card">
        <div className="checkmark">✓</div>
        <h2>Exam Submitted Successfully</h2>
        <p>
          Thank you for completing the examination. Your responses have been
          recorded successfully.
        </p>
        <p className="sub-text">
          We appreciate your time and effort. Wishing you the very best for
          your results.
        </p>
      </div>
    </div>
  );
}