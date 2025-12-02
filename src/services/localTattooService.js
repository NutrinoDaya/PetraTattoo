/**
 * Local Tattoo Database Service
 * Using AsyncStorage for reliable local data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Store keys
const STORE_KEYS = {
  WORKERS: 'PetraTatoo_workers',
  CLIENTS: 'PetraTatoo_clients',
  APPOINTMENTS: 'PetraTatoo_appointments',
  PAYMENTS: 'PetraTatoo_payments',
};

export class LocalTattooService {
  constructor() {
    this.isReady = false;
  }

  async initialize() {
    try {
      console.log('Initializing PetraTatoo database...');
      await this.seedInitialData();
      this.isReady = true;
      console.log('Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async seedInitialData() {
    try {
      // Check if data already exists
      const existingWorkers = await AsyncStorage.getItem(STORE_KEYS.WORKERS);
      
      if (!existingWorkers) {
        console.log('Seeding initial data...');

        // Initial workers
        const workers = [
          {
            id: 1,
            username: 'admin',
            email: 'admin@PetraTatoo.com',
            full_name: 'Admin',
            role: 'admin',
            specialties: 'Administration',
            paper: 'Admin Access',
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            username: 'carlos',
            email: 'carlos@PetraTatoo.com',
            full_name: 'Carlos Rodriguez',
            role: 'artist',
            specialties: 'Black & Gray, Realism',
            paper: 'License #001',
            created_at: new Date().toISOString(),
          },
          {
            id: 3,
            username: 'maria',
            email: 'maria@PetraTatoo.com',
            full_name: 'Maria Garcia',
            role: 'artist',
            specialties: 'Color Tattoos, Watercolor',
            paper: 'License #002',
            created_at: new Date().toISOString(),
          },
        ];

        // Initial clients
        const clients = [
          {
            id: 1,
            full_name: 'Juan Perez',
            email: 'juan@email.com',
            phone: '+34 612345678',
            paper: 'ID #123456',
            notes: 'Wants black & gray sleeve',
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            full_name: 'Sofia Martinez',
            email: 'sofia@email.com',
            phone: '+34 687654321',
            paper: 'ID #654321',
            notes: 'Interested in colorful designs',
            created_at: new Date().toISOString(),
          },
        ];

        // Save initial data
        await AsyncStorage.setItem(STORE_KEYS.WORKERS, JSON.stringify(workers));
        await AsyncStorage.setItem(STORE_KEYS.CLIENTS, JSON.stringify(clients));
        await AsyncStorage.setItem(STORE_KEYS.APPOINTMENTS, JSON.stringify([]));
        await AsyncStorage.setItem(STORE_KEYS.PAYMENTS, JSON.stringify([]));

        console.log('Initial data seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding initial data:', error);
      throw error;
    }
  }

  // Worker operations
  async getWorkers() {
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.WORKERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting workers:', error);
      return [];
    }
  }

  async addWorker(workerData) {
    try {
      const workers = await this.getWorkers();
      const newWorker = {
        id: workers.length > 0 ? Math.max(...workers.map(w => w.id)) + 1 : 1,
        ...workerData,
        created_at: new Date().toISOString(),
      };
      workers.push(newWorker);
      await AsyncStorage.setItem(STORE_KEYS.WORKERS, JSON.stringify(workers));
      return newWorker;
    } catch (error) {
      console.error('Error adding worker:', error);
      throw error;
    }
  }

  async updateWorker(id, workerData) {
    try {
      const workers = await this.getWorkers();
      const index = workers.findIndex(w => w.id === id);
      if (index !== -1) {
        workers[index] = { ...workers[index], ...workerData };
        await AsyncStorage.setItem(STORE_KEYS.WORKERS, JSON.stringify(workers));
        return workers[index];
      }
      throw new Error('Worker not found');
    } catch (error) {
      console.error('Error updating worker:', error);
      throw error;
    }
  }

  async deleteWorker(id) {
    try {
      const workers = await this.getWorkers();
      const filtered = workers.filter(w => w.id !== id);
      await AsyncStorage.setItem(STORE_KEYS.WORKERS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting worker:', error);
      throw error;
    }
  }

  // Client operations
  async getClients() {
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.CLIENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting clients:', error);
      return [];
    }
  }

  async addClient(clientData) {
    try {
      const clients = await this.getClients();
      const newClient = {
        id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
        ...clientData,
        created_at: new Date().toISOString(),
      };
      clients.push(newClient);
      await AsyncStorage.setItem(STORE_KEYS.CLIENTS, JSON.stringify(clients));
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  }

  async updateClient(id, clientData) {
    try {
      const clients = await this.getClients();
      const index = clients.findIndex(c => c.id === id);
      if (index !== -1) {
        clients[index] = { ...clients[index], ...clientData };
        await AsyncStorage.setItem(STORE_KEYS.CLIENTS, JSON.stringify(clients));
        return clients[index];
      }
      throw new Error('Client not found');
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async deleteClient(id) {
    try {
      const clients = await this.getClients();
      const filtered = clients.filter(c => c.id !== id);
      await AsyncStorage.setItem(STORE_KEYS.CLIENTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // Appointment operations
  async getAppointments() {
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  }

  async getTodayAppointments() {
    try {
      const appointments = await this.getAppointments();
      const today = new Date().toISOString().split('T')[0];
      return appointments.filter(apt => apt.appointment_date === today);
    } catch (error) {
      console.error('Error getting today appointments:', error);
      return [];
    }
  }

  async addAppointment(appointmentData) {
    try {
      const appointments = await this.getAppointments();
      const newAppointment = {
        id: appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1,
        status: 'scheduled',
        ...appointmentData,
        created_at: new Date().toISOString(),
      };
      appointments.push(newAppointment);
      await AsyncStorage.setItem(STORE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      return newAppointment;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id, appointmentData) {
    try {
      const appointments = await this.getAppointments();
      const index = appointments.findIndex(a => a.id === id);
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...appointmentData };
        await AsyncStorage.setItem(STORE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        return appointments[index];
      }
      throw new Error('Appointment not found');
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId, status) {
    try {
      return await this.updateAppointment(appointmentId, { 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  async deleteAppointment(id) {
    try {
      const appointments = await this.getAppointments();
      const filtered = appointments.filter(a => a.id !== id);
      await AsyncStorage.setItem(STORE_KEYS.APPOINTMENTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  // Payment operations
  async getPayments() {
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.PAYMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting payments:', error);
      return [];
    }
  }

  async addPayment(paymentData) {
    try {
      const payments = await this.getPayments();
      const newPayment = {
        id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1,
        ...paymentData,
        created_at: new Date().toISOString(),
      };
      payments.push(newPayment);
      await AsyncStorage.setItem(STORE_KEYS.PAYMENTS, JSON.stringify(payments));
      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  async getPaymentsByArtist(artistId) {
    try {
      const payments = await this.getPayments();
      return payments.filter(p => p.worker_id === artistId);
    } catch (error) {
      console.error('Error getting artist payments:', error);
      return [];
    }
  }

  // Analytics
  async getAnalytics() {
    try {
      const appointments = await this.getAppointments();
      const payments = await this.getPayments();
      const clients = await this.getClients();
      const workers = await this.getWorkers();

      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().substring(0, 7);

      // Today's appointments
      const todayAppointments = appointments.filter(
        apt => apt.appointment_date === today
      );

      // Today's payments
      const todayPayments = payments.filter(p => p.payment_date === today);
      const todayRevenue = todayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // Monthly payments
      const monthlyPayments = payments.filter(
        p => p.payment_date && p.payment_date.startsWith(currentMonth)
      );
      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // Monthly appointments
      const monthlyAppointments = appointments.filter(
        apt => apt.appointment_date && apt.appointment_date.startsWith(currentMonth)
      );

      // Artist payment counts breakdown
      const artistEarnings = {};
      workers.forEach(worker => {
        if (worker.role === 'artist') {
          const artistPayments = payments.filter(p => p.worker_id === worker.id);
          const totalAmount = artistPayments.reduce(
            (sum, p) => sum + (parseFloat(p.amount) || 0),
            0
          );
          artistEarnings[worker.full_name] = {
            id: worker.id,
            earnings: totalAmount,
            paymentsCount: artistPayments.length,
          };
        }
      });

      return {
        todayRevenue,
        monthlyRevenue,
        todayAppointmentsCount: todayAppointments.length,
        monthlyAppointmentsCount: monthlyAppointments.length,
        totalClients: clients.length,
        totalWorkers: workers.filter(w => w.role === 'artist').length,
        artistEarnings,
        allArtistEarnings: Object.values(artistEarnings).reduce(
          (sum, a) => sum + a.earnings,
          0
        ),
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        todayRevenue: 0,
        monthlyRevenue: 0,
        todayAppointmentsCount: 0,
        monthlyAppointmentsCount: 0,
        totalClients: 0,
        totalWorkers: 0,
        artistEarnings: {},
        allArtistEarnings: 0,
      };
    }
  }
}

// Export singleton instance
export const dbService = new LocalTattooService();
