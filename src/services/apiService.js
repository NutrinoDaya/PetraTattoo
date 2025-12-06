import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
const BASE_URL = 'http://10.0.2.2:8000'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiService = {
  login: async (username, password) => {
    // Mock login for demo/testing purposes
    if (username === 'demo_worker' || username === 'admin' || username === 'demo') {
        const role = username === 'admin' ? 'admin' : 'worker';
        const user = {
            id: 1,
            username: username,
            full_name: username === 'admin' ? 'Admin User' : 'Demo Artist',
            role: role,
            email: 'demo@example.com'
        };
        
        // Store session
        await AsyncStorage.setItem('authToken', 'mock_token_' + Date.now());
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        return {
            user: user,
            access_token: 'mock_token_' + Date.now()
        };
    }
    
    try {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    } catch (error) {
        console.warn('Login API failed, falling back to mock if applicable', error);
        throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },

  getAppointments: async (userId, date) => {
    // Mock data
    return [
        {
            id: 1,
            time: '10:00 AM',
            customer_name: 'John Doe',
            tattoo_type: 'Traditional Rose',
            price: 150,
            status: 'upcoming',
            date: new Date().toISOString().split('T')[0],
            artist_name: 'Demo Artist'
        },
        {
            id: 2,
            time: '2:00 PM',
            customer_name: 'Jane Smith',
            tattoo_type: 'Geometric Wolf',
            price: 300,
            status: 'completed',
            date: new Date().toISOString().split('T')[0],
            artist_name: 'Demo Artist'
        },
        {
            id: 3,
            time: '11:00 AM',
            customer_name: 'Mike Johnson',
            tattoo_type: 'Sleeve Work',
            price: 500,
            status: 'upcoming',
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
            artist_name: 'Demo Artist'
        }
    ];
  },

  getPayments: async (userId) => {
    // Mock data
    return [
        {
            id: 1,
            customer_name: 'John Doe',
            artist_name: 'Demo Artist',
            tattoo_type: 'Traditional Rose',
            amount: 150,
            tip_amount: 20,
            payment_method: 'cash',
            date: new Date().toISOString().split('T')[0],
            worker_earnings: 100,
            shop_commission: 50,
            notes: 'First session'
        },
        {
            id: 2,
            customer_name: 'Alice Cooper',
            artist_name: 'Demo Artist',
            tattoo_type: 'Skull',
            amount: 200,
            tip_amount: 50,
            payment_method: 'card',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
            worker_earnings: 140,
            shop_commission: 60,
            notes: ''
        }
    ];
  },
  
  createPayment: async (data) => {
      console.log('Creating payment:', data);
      return { ...data, id: Date.now() };
  },
  
  updatePayment: async (id, data) => {
      console.log('Updating payment:', id, data);
      return { ...data, id };
  },
  
  deletePayment: async (id) => {
      console.log('Deleting payment:', id);
      return true;
  }
};

export default apiService;
