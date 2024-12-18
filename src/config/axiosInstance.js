import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://192.168.1.49:8080/api"
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Set Authorization header
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
