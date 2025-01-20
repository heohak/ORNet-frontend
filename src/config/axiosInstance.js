import axios from "axios";
import { jwtDecode } from "jwt-decode";


const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api",
    // baseURL: "http://192.168.1.49:8080/api",
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

// Response interceptor: Handle token refresh and 401 responses
axiosInstance.interceptors.response.use(
    (response) => {
        // Check if a new token is present in the response headers
        const newToken = response.headers["authorization"]?.split(" ")[1]; // Extract token from "Bearer <token>"
        if (newToken) {
            localStorage.setItem("token", newToken); // Save the new token in localStorage
        }
        return response;
    },
    (error) => {
        // if (error.response && error.response.status === 401) {
        //     // Token is expired or invalid, redirect to login page
        //     localStorage.removeItem("token"); // Remove the expired token
        //     window.location.href = "/login"; // Redirect to the login page
        //     alert("Your session has expired. Please log in again."); // maybe there is a better option to notify user
        // }

        if (error.response && error.response.status === 401) {
            const token = localStorage.getItem("token");

            // Check if the token is actually expired
            if (isTokenExpired(token)) {
                localStorage.removeItem("token");
                window.location.href = "/login";
                alert("Your session has expired. Please log in again.");
            }
        }
        return Promise.reject(error);
    }
);

function isTokenExpired(token) {
    if (!token) return true; // No token is effectively 'expired'
    try {
        const { exp } = jwtDecode(token); // Decode the token to extract expiration
        // JWT 'exp' is in seconds; convert to milliseconds and compare with the current time
        return exp * 1000 < Date.now();
    } catch (error) {
        // If decoding fails, consider the token expired/invalid
        console.error("Failed to decode token:", error);
        return true;
    }
}

export default axiosInstance;
