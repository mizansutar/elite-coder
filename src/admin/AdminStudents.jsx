import { useLocation, useNavigate } from "react-router-dom";
import "./AdminStudents.css";

export default function AdminStudents() {

  const location = useLocation();
  const navigate = useNavigate();

  const exam = location.state;

  if (!exam) {
    return <div className="students-page">No data available.</div>;
  }

  return (
    <div className="students-page">

      <div className="students-container">

        <h2 className="students-title">
          {exam.title} — Students
        </h2>

        <div className="table-wrapper">
          <table className="students-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {exam.students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.score}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate("/admin/student-result", { state: student })
                      }
                    >
                      View Result
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}