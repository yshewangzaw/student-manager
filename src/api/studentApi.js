import axios from "axios";

const API = "https://your-api-url.com/students";

// GET all students
export const getStudents = () => axios.get(API);

// ADD student
export const addStudent = (data) => axios.post(API, data);

// DELETE student
export const deleteStudent = (id) => axios.delete(`${API}/${id}`);
