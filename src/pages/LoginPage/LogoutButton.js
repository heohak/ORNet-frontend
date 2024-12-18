import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
            localStorage.removeItem("token"); // Remove the token locally
            alert("Logged out successfully!");
            navigate("/login");
        } catch (err) {
            console.error("Error during logout", err);
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;

