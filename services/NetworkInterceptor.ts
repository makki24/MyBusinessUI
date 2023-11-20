// NetworkInterceptor.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://your-api-base-url';

// Create an instance of axios to use interceptors
const axiosInstance = axios.create({
    baseURL: BASE_URL,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    async (config) => { // Removed the type annotation here
        try {
            // Get the token from AsyncStorage
            const token = await AsyncStorage.getItem('@token');

            // Add the Authorization header if a token is available
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        } catch (error) {
            console.error('Error adding Authorization header:', error);
            return Promise.reject(error);
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
