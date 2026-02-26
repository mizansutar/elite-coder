import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin pages
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import CreateExam from "./admin/CreateExam";
import AddQuestions from "./admin/AddQuestions";
import AdminExamResults from "./admin/AdminExamResults";
import AdminStudentResult from "./admin/AdminStudentResult";

// Student pages
import Register from "./student/Register";
import Quiz from "./student/Quiz";
import Result from "./student/Result";
import AllMeritList from "./student/AllMeritList";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Admin */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/create-exam" element={<CreateExam />} />
        <Route path="/admin/add-questions" element={<AddQuestions />} />

        {/* Results flow */}
        <Route path="/admin/exam-results" element={<AdminExamResults />} />
        <Route path="/admin/student-result/:id" element={<AdminStudentResult />} />

        {/* Student */}
        <Route path="/exam/:code" element={<Register />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        

<Route path="/student/all-merit" element={<AllMeritList />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
