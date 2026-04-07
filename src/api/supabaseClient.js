import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Authentication functions - direct Supabase implementation
export const authAPI = {
  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Login with email and password
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      return { user: null, session: null, error: error.message };
    }
  },

  // Register new user
  async register(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      return { user: null, session: null, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Update user password
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      return null;
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helper functions
export const dbAPI = {
  // Get user profile by email
  async getUserProfile(userEmail) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get user balance by email
  async getUserBalance(userEmail) {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_email', userEmail)
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get user portfolio by email
  async getUserPortfolio(userEmail) {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_email', userEmail);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get user transactions by email
  async getUserTransactions(userEmail, limit = 50) {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });
      
      if (limit) query = query.limit(limit);
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get copy trades for user by email
  async getUserCopyTrades(userEmail) {
    try {
      const { data, error } = await supabase
        .from('copy_trades')
        .select('*')
        .eq('user_email', userEmail)
        .eq('is_active', true);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Create deposit request
  async createDepositRequest(userEmail, amount, currency = 'USD') {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_email: userEmail,
          type: 'deposit',
          amount: parseFloat(amount),
          status: 'pending',
          notes: `Deposit request for ${amount} ${currency}`
        }])
        .select();
      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Create withdrawal request
  async createWithdrawalRequest(userEmail, amount, currency = 'USD', walletAddress) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_email: userEmail,
          type: 'withdrawal',
          amount: parseFloat(amount),
          wallet_address: walletAddress,
          status: 'pending',
          notes: `Withdrawal request for ${amount} ${currency}`
        }])
        .select();
      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
};

export default supabase;
