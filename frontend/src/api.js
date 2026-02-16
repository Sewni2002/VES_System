// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: '/', // let proxy redirect to backend
});

export default API;
