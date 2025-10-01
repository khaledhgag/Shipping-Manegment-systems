// src/testApi.js
import api from './Services/api';

export const testApiConnection = async () => {
  try {
    console.log('Test API: Testing connection...');
    const response = await api.get('/User');
    console.log('Test API: Connection successful', response.status, response.data);
    return true;
  } catch (error) {
    console.error('Test API: Connection failed', error);
    return false;
  }
};

// يمكنك استدعاء هذه الدالة من أي مكون لاختبار الاتصال