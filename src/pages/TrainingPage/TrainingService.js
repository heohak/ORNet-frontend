import axiosInstance from "../../config/axiosInstance";

const TrainingService = {
    getTrainings: async (filters = {}) => {
        const response = await axiosInstance.get("/training/all", { params: filters });
        return response.data;
    },

    addTraining: async (trainingData) => {
        return await axiosInstance.post("/training/add", trainingData);
    },

    updateTraining: async (trainingId, trainingData) => {
        return await axiosInstance.put(`/training/update/${trainingId}`, trainingData);
    },

    deleteTraining: async (trainingId) => {
        return await axiosInstance.delete(`/training/${trainingId}`);
    }
};

export default TrainingService;
