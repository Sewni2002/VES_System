// src/api/licApi.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend base
  headers: { "Content-Type": "application/json" },
});
