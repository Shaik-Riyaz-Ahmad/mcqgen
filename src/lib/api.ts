const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      console.log('🔍 API Client initialized with token:', this.token ? 'Token present' : 'No token found');
    }
  }

  setToken(token: string) {
    console.log('🔍 Setting token:', token ? 'New token set' : 'Token cleared');
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('API Request:', url, options);
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('API Response status:', response.status, 'for URL:', url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error response:', errorData, 'Status:', response.status);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Success response:', data);
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const url = `${this.baseURL}/auth/login`;
    console.log('Attempting login to:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error response:', errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login successful, received data:', data);
      return { data };
    } catch (error) {
      console.error('Login fetch error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    const result = await this.request<any>('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return result;
  }

  // User endpoints
  async getCurrentUser() {
    return this.request<any>('/users/me');
  }

  async updateProfile(userData: { full_name?: string }) {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // MCQ endpoints
  async generateMCQ(data: {
    text: string;
    num_questions: number;
    subject: string;
    difficulty: string;
  }) {
    return this.request<any>('/mcq/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createQuizSet(quizData: {
    title: string;
    description?: string;
    subject: string;
    difficulty: string;
    source_text: string;
    questions: any[];
    is_public?: boolean;
  }) {
    console.log('🔍 API createQuizSet called with:', quizData);
    console.log('🔍 Current token:', this.token ? 'Token present' : 'No token');
    
    const result = await this.request<any>('/mcq/quiz-sets', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
    
    console.log('🔍 createQuizSet result:', result);
    return result;
  }

  async getQuizSets(params?: { skip?: number; limit?: number; subject?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.subject) queryParams.append('subject', params.subject);

    const queryString = queryParams.toString();
    const endpoint = `/mcq/quiz-sets${queryString ? `?${queryString}` : ''}`;

    return this.request<any[]>(endpoint);
  }

  async getQuizSet(id: number) {
    return this.request<any>(`/mcq/quiz-sets/${id}`);
  }

  async submitQuizAttempt(quizSetId: number, answers: Record<string, string>) {
    return this.request<any>(`/mcq/quiz-sets/${quizSetId}/attempt`, {
      method: 'POST',
      body: JSON.stringify({
        quiz_set_id: quizSetId,
        answers,
      }),
    });
  }

  async getQuizAttempts(quizSetId: number) {
    return this.request<any[]>(`/mcq/quiz-sets/${quizSetId}/attempts`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
