import axios from "axios";

const API_URL = "http://localhost:3000/api/students";

// GET ALL STUDENTS
export const getStudents = () => axios.get(API_URL);

// CREATE STUDENT
export const createStudent = (data) => axios.post(API_URL, data);

// UPDATE STUDENT
export const updateStudent = (id, data) => axios.put(`${API_URL}/${id}`, data);

// DELETE STUDENT
export const deleteStudent = (id) => axios.delete(`${API_URL}/${id}`);
