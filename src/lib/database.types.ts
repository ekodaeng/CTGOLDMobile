export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          member_code: string
          full_name: string
          email: string
          city: string
          phone: string | null
          telegram_username: string | null
          role: 'MEMBER' | 'ADMIN'
          status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          member_code?: string
          full_name: string
          email: string
          city: string
          phone?: string | null
          telegram_username?: string | null
          role?: 'MEMBER' | 'ADMIN'
          status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          member_code?: string
          full_name?: string
          email?: string
          city?: string
          phone?: string | null
          telegram_username?: string | null
          role?: 'MEMBER' | 'ADMIN'
          status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          is_active?: boolean
        }
      }
      member_logs: {
        Row: {
          id: string
          member_id: string
          action: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          action: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          action?: string
          metadata?: Json
          created_at?: string
        }
      }
      tutorials: {
        Row: {
          id: string
          title: string
          description: string
          steps: string
          order_number: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          steps: string
          order_number?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          steps?: string
          order_number?: number
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          title: string
          description: string
          type: 'buyback' | 'burn' | 'trading'
          image_url: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: 'buyback' | 'burn' | 'trading'
          image_url?: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: 'buyback' | 'burn' | 'trading'
          image_url?: string
          date?: string
          created_at?: string
        }
      }
      brokers: {
        Row: {
          id: string
          name: string
          description: string
          website_url: string
          logo_url: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          website_url?: string
          logo_url?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          website_url?: string
          logo_url?: string
          is_active?: boolean
          created_at?: string
        }
      }
      trading_activities: {
        Row: {
          id: string
          instrument: 'XAUUSD' | 'BTCUSD'
          action: 'buy' | 'sell'
          price: number
          volume: number
          profit_loss: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          instrument: 'XAUUSD' | 'BTCUSD'
          action: 'buy' | 'sell'
          price: number
          volume: number
          profit_loss?: number
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          instrument?: 'XAUUSD' | 'BTCUSD'
          action?: 'buy' | 'sell'
          price?: number
          volume?: number
          profit_loss?: number
          date?: string
          created_at?: string
        }
      }
      ctgold_balances: {
        Row: {
          member_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          member_id: string
          balance?: number
          updated_at?: string
        }
        Update: {
          member_id?: string
          balance?: number
          updated_at?: string
        }
      }
      ctgold_transactions: {
        Row: {
          id: string
          member_id: string
          type: 'buy' | 'reward' | 'referral' | 'burn_info' | 'transfer'
          amount: number
          status: 'pending' | 'completed' | 'failed'
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          type: 'buy' | 'reward' | 'referral' | 'burn_info' | 'transfer'
          amount: number
          status?: 'pending' | 'completed' | 'failed'
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          type?: 'buy' | 'reward' | 'referral' | 'burn_info' | 'transfer'
          amount?: number
          status?: 'pending' | 'completed' | 'failed'
          description?: string
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          created_at?: string
        }
      }
    }
  }
}
