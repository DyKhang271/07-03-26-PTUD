import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import StudentList from './pages/StudentList'
import AddStudent from './pages/AddStudent'
import EditStudent from './pages/EditStudent'
import ClassList from './pages/ClassList'
import AddClass from './pages/AddClass'
import EditClass from './pages/EditClass'
import Statistics from './pages/Statistics'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<StudentList />} />
          <Route path="/add" element={<AddStudent />} />
          <Route path="/edit/:id" element={<EditStudent />} />
          <Route path="/classes" element={<ClassList />} />
          <Route path="/classes/add" element={<AddClass />} />
          <Route path="/classes/edit/:id" element={<EditClass />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
