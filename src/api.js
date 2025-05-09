import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default api;

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await axios.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}; 