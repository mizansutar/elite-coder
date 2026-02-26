import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin pages
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import CreateExam from "./admin/CreateExam";
import AddQuestions from "./admin/AddQuestions";
import AdminExamResults from "./admin/AdminExamResults";
import AdminStudentResult from "./admin/AdminStudentResult";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";

// Student pages
import Register from "./student/Register";
import Quiz from "./student/Quiz";
import Result from "./student/Result";
import AllMeritList from "./student/AllMeritList";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Admin Login (Unprotected) */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <Dashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/create-exam"
          element={
            <AdminProtectedRoute>
              <CreateExam />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/add-questions"
          element={
            <AdminProtectedRoute>
              <AddQuestions />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/exam-results"
          element={
            <AdminProtectedRoute>
              <AdminExamResults />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/student-result/:id"
          element={
            <AdminProtectedRoute>
              <AdminStudentResult />
            </AdminProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route path="/exam/:code" element={<Register />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/student/all-merit" element={<AllMeritList />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;