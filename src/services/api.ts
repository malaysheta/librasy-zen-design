const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

interface User {
  id: string;
  name: string;
  fullName: string;
  email: string;
  rollNumber: string;
  collegeName: string;
  profileImage?: string;
  profileImagePublicId?: string;
  role: 'admin' | 'student';
}

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  description?: string;
  genre?: string;
  publicationYear?: number;
  publisher?: string;
  totalCopies: number;
  availableCopies: number;
  status: 'Available' | 'Borrowed' | 'Maintenance' | 'Lost';
  coverImage?: string;
  cloudinaryPublicId?: string;
  qrCode?: string;
  qrCodePublicId?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BookStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
}

interface AuthResponse {
  user: User;
  token: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ user: User }>('/auth/me');
    return response.data!.user;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async updateProfile(profileData: {
    name: string;
    fullName: string;
    email: string;
    rollNumber: string;
    collegeName: string;
    profileImage?: string;
    profileImagePublicId?: string;
  }): Promise<User> {
    const response = await this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data!.user;
  }

  // Health check
  async healthCheck(): Promise<{ message: string; timestamp: string }> {
    const response = await this.request<{ message: string; timestamp: string }>('/health');
    return response.data!;
  }

  // Book methods
  async getBooks(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    genre?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ books: Book[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('API Service: Making request to:', this.baseURL + endpoint);
    const response = await this.request<{ books: Book[]; pagination: any }>(endpoint);
    console.log('API Service: Response received:', response);
    return response.data!;
  }

  async getBook(id: string): Promise<Book> {
    const response = await this.request<Book>(`/books/${id}`);
    return response.data!;
  }

  async createBook(bookData: {
    title: string;
    author: string;
    isbn: string;
    description?: string;
    genre?: string;
    publicationYear?: number;
    publisher?: string;
    totalCopies: number;
    coverImage?: string;
  }): Promise<Book> {
    const response = await this.request<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
    return response.data!;
  }

  async updateBook(id: string, bookData: Partial<Book>): Promise<Book> {
    const response = await this.request<Book>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
    return response.data!;
  }

  async deleteBook(id: string): Promise<void> {
    await this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  async getBookStats(): Promise<BookStats> {
    const response = await this.request<BookStats>('/books/stats/overview');
    return response.data!;
  }

  // Image upload methods
  async uploadImage(file: File): Promise<{ public_id: string; secure_url: string; width: number; height: number; format: string; bytes: number }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseURL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }

    return data.data;
  }

  async deleteImage(publicId: string): Promise<void> {
    await this.request(`/upload/image/${publicId}`, {
      method: 'DELETE',
    });
  }

  // QR code methods
  async generateQRCode(bookId: string): Promise<{ qrCodeUrl: string; qrCodePublicId: string; metadata: any }> {
    const response = await this.request<{ qrCodeUrl: string; qrCodePublicId: string; metadata: any }>(`/qr/generate/${bookId}`, {
      method: 'POST',
    });
    return response.data!;
  }

  async generateAllQRCodes(): Promise<{ totalBooks: number; successCount: number; errorCount: number; results: any[] }> {
    const response = await this.request<{ totalBooks: number; successCount: number; errorCount: number; results: any[] }>('/qr/generate-all', {
      method: 'POST',
    });
    return response.data!;
  }

  async getBookQRCode(bookId: string): Promise<{ qrCodeUrl: string; qrCodePublicId: string }> {
    const response = await this.request<{ qrCodeUrl: string; qrCodePublicId: string }>(`/qr/book/${bookId}`);
    return response.data!;
  }

  async generateCustomQRCode(data: string, options?: any): Promise<{ qrCodeUrl: string; qrCodePublicId: string }> {
    const response = await this.request<{ qrCodeUrl: string; qrCodePublicId: string }>('/qr/custom', {
      method: 'POST',
      body: JSON.stringify({ data, options }),
    });
    return response.data!;
  }

  // Issue/Book lending methods
  async issueBook(bookId: string, rollNumber: string): Promise<any> {
    const response = await this.request('/issues/issue-book', {
      method: 'POST',
      body: JSON.stringify({ bookId, rollNumber }),
    });
    return response.data!;
  }

  async issueBookByQR(qrData: string, rollNumber: string): Promise<any> {
    const response = await this.request('/issues/issue-by-qr', {
      method: 'POST',
      body: JSON.stringify({ qrData, rollNumber }),
    });
    return response.data!;
  }

  async getStudentBooks(rollNumber: string): Promise<any[]> {
    const response = await this.request(`/issues/student/${rollNumber}`);
    return response.data!;
  }

  async getOverdueBooks(): Promise<any[]> {
    const response = await this.request('/issues/overdue');
    return response.data!;
  }

  async returnBook(issueId: string): Promise<any> {
    const response = await this.request(`/issues/return/${issueId}`, {
      method: 'PUT',
    });
    return response.data!;
  }

  async getIssueStats(): Promise<any> {
    const response = await this.request('/issues/stats');
    return response.data!;
  }

  // Student methods
  async getMyBooks(): Promise<{
    currentBooks: any[];
    returnedBooks: any[];
    totalCurrent: number;
    totalReturned: number;
  }> {
    const response = await this.request('/issues/my-books');
    return response.data!;
  }

  async getNotifications(): Promise<any[]> {
    const response = await this.request('/issues/notifications');
    return response.data!;
  }
}

export const apiService = new ApiService();
export type { User, AuthResponse, ApiResponse, Book, BookStats };
