/**
 * dbClient.js - Supabase Database Adapter Layer
 *
 * Provides a unified entity API on top of Supabase for all pages.
 *
 * Entity Methods:
 * - .list(orderBy?, limit?)
 * - .filter(conditions, orderBy?, limit?)
 * - .get(id)
 * - .create(data)
 * - .update(id, data)
 * - .delete(id)
 */

import { supabase } from './supabaseClient';
import { authAPI } from './supabaseClient';

/**
 * Generic Entity Class
 * Provides CRUD operations for any Supabase table
 */
class Entity {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async list(orderBy = null, limit = 100) {
    try {
      let query = supabase.from(this.tableName).select('*');
      if (orderBy) query = query.order(orderBy.replace('-', ''), { ascending: !orderBy.startsWith('-') });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[db] Error listing ${this.tableName}:`, error);
      return [];
    }
  }

  async filter(conditions = {}, orderBy = null, limit = 100) {
    try {
      let query = supabase.from(this.tableName).select('*');
      
      // Apply filter conditions
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      // Apply ordering
      if (orderBy) {
        const isDesc = orderBy.startsWith('-');
        const field = isDesc ? orderBy.substring(1) : orderBy;
        query = query.order(field, { ascending: !isDesc });
      }
      
      // Apply limit
      if (limit) query = query.limit(limit);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[db] Error filtering ${this.tableName}:`, error);
      return [];
    }
  }

  async get(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`[db] Error getting ${this.tableName} record:`, error);
      return null;
    }
  }

  async create(data) {
    try {
      const { data: created, error } = await supabase
        .from(this.tableName)
        .insert([data])
        .select();
      if (error) throw error;
      return created?.[0] || null;
    } catch (error) {
      console.error(`[db] Error creating ${this.tableName} record:`, error);
      return null;
    }
  }

  async update(id, data) {
    try {
      const { data: updated, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select();
      if (error) throw error;
      return updated?.[0] || null;
    } catch (error) {
      console.error(`[db] Error updating ${this.tableName} record:`, error);
      return null;
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`[db] Error deleting ${this.tableName} record:`, error);
      return false;
    }
  }
}

/**
 * Database Client API - Main export
 * Provides access to all entities
 */
export const base44 = {
  entities: {
    User: new Entity('users'),
    UserBalance: new Entity('user_balances'),
    Cryptocurrency: new Entity('cryptocurrencies'),
    Portfolio: new Entity('portfolio'),
    Transaction: new Entity('transactions'),
    CopyTrader: new Entity('copy_traders'),
    CopyTrade: new Entity('copy_trades'),
    PlatformSettings: new Entity('platform_settings'),
    EmailNotification: new Entity('email_notifications'),
  },

  /**
   * Helper method to get current user's email from auth
   */
  async getCurrentUserEmail() {
    const user = await authAPI.getCurrentUser();
    return user?.email || null;
  },

  /**
   * Helper method to get current user's full profile
   */
  async getCurrentUserProfile() {
    try {
      const email = await this.getCurrentUserEmail();
      if (!email) return null;
      
      const users = await this.entities.User.filter({ email });
      return users?.[0] || null;
    } catch (error) {
      console.error('[db] Error getting current user profile:', error);
      return null;
    }
  },

  /**
   * Get user's balance with default values
   */
  async getUserBalance(userEmail) {
    try {
      const balances = await this.entities.UserBalance.filter({ user_email: userEmail });
      return balances?.[0] || {
        user_email: userEmail,
        balance_usd: 0,
        total_invested: 0,
        total_profit_loss: 0,
      };
    } catch (error) {
      console.error('[db] Error getting user balance:', error);
      return null;
    }
  },

  /**
   * Get user's portfolio holdings
   */
  async getUserPortfolio(userEmail) {
    try {
      return await this.entities.Portfolio.filter({ user_email: userEmail });
    } catch (error) {
      console.error('[db] Error getting portfolio:', error);
      return [];
    }
  },

  /**
   * Get user's transactions
   */
  async getUserTransactions(userEmail, limit = 50) {
    try {
      return await this.entities.Transaction.filter(
        { user_email: userEmail },
        '-created_at',
        limit
      );
    } catch (error) {
      console.error('[db] Error getting transactions:', error);
      return [];
    }
  },

  /**
   * Get user's copy trades
   */
  async getUserCopyTrades(userEmail) {
    try {
      return await this.entities.CopyTrade.filter({ user_email: userEmail });
    } catch (error) {
      console.error('[db] Error getting copy trades:', error);
      return [];
    }
  },

  /**
   * Create a deposit request
   */
  async createDepositRequest(userEmail, amount, currency = 'USD') {
    try {
      return await this.entities.Transaction.create({
        user_email: userEmail,
        type: 'deposit',
        amount: parseFloat(amount),
        status: 'pending',
        notes: `Deposit request for ${amount} ${currency}`,
      });
    } catch (error) {
      console.error('[db] Error creating deposit request:', error);
      return null;
    }
  },

  /**
   * Create a withdrawal request
   */
  async createWithdrawalRequest(userEmail, amount, currency = 'USD', walletAddress) {
    try {
      return await this.entities.Transaction.create({
        user_email: userEmail,
        type: 'withdrawal',
        amount: parseFloat(amount),
        wallet_address: walletAddress,
        status: 'pending',
        notes: `Withdrawal request for ${amount} ${currency}`,
      });
    } catch (error) {
      console.error('[db] Error creating withdrawal request:', error);
      return null;
    }
  },

  /**
   * Get platform setting by key
   */
  async getPlatformSetting(key) {
    try {
      const settings = await this.entities.PlatformSettings.filter({ key });
      return settings?.[0] || null;
    } catch (error) {
      console.error('[db] Error getting platform setting:', error);
      return null;
    }
  },

  /**
   * Update platform setting
   */
  async updatePlatformSetting(key, value, label = null) {
    try {
      const existing = await this.getPlatformSetting(key);
      
      if (existing) {
        return await this.entities.PlatformSettings.update(existing.id, {
          value,
          label: label || existing.label,
        });
      } else {
        return await this.entities.PlatformSettings.create({
          key,
          value,
          label,
        });
      }
    } catch (error) {
      console.error('[db] Error updating platform setting:', error);
      return null;
    }
  },
};

export default base44;
