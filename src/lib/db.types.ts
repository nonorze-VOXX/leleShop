export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      artist: {
        Row: {
          artist_name: string
          id: number
          report_key: string | null
          visible: boolean
        }
        Insert: {
          artist_name: string
          id?: never
          report_key?: string | null
          visible?: boolean
        }
        Update: {
          artist_name?: string
          id?: never
          report_key?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      artist_alias: {
        Row: {
          artist_alias: string
          artist_id: number
        }
        Insert: {
          artist_alias: string
          artist_id: number
        }
        Update: {
          artist_alias?: string
          artist_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "artist_alias_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_alias_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "default_artist_view"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_commission: {
        Row: {
          artist_id: number
          commission: number
          store_id: number
          year_month: string
        }
        Insert: {
          artist_id: number
          commission: number
          store_id: number
          year_month: string
        }
        Update: {
          artist_id?: number
          commission?: number
          store_id?: number
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_commision_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_commision_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "default_artist_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_commision_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store"
            referencedColumns: ["id"]
          },
        ]
      }
      store: {
        Row: {
          created_at: string
          id: number
          store_name: string
        }
        Insert: {
          created_at?: string
          id?: number
          store_name: string
        }
        Update: {
          created_at?: string
          id?: number
          store_name?: string
        }
        Relationships: []
      }
      trade_body: {
        Row: {
          artist_id: number
          discount: number
          id: number
          item_name: string
          net_sales: number
          quantity: number
          total_sales: number
          trade_id: string
        }
        Insert: {
          artist_id: number
          discount: number
          id?: never
          item_name: string
          net_sales: number
          quantity: number
          total_sales: number
          trade_id: string
        }
        Update: {
          artist_id?: number
          discount?: number
          id?: never
          item_name?: string
          net_sales?: number
          quantity?: number
          total_sales?: number
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_body_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_body_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "default_artist_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_body_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trade_head"
            referencedColumns: ["trade_id"]
          },
        ]
      }
      trade_head: {
        Row: {
          store_id: number
          trade_date: string
          trade_id: string
        }
        Insert: {
          store_id?: number
          trade_date: string
          trade_id: string
        }
        Update: {
          store_id?: number
          trade_date?: string
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_head_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      artist_trade: {
        Row: {
          artist_id: number | null
          artist_name: string | null
          discount: number | null
          id: number | null
          item_name: string | null
          net_sales: number | null
          quantity: number | null
          store_name: string | null
          total_sales: number | null
          trade_date: string | null
          trade_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_body_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_body_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "default_artist_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_body_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trade_head"
            referencedColumns: ["trade_id"]
          },
        ]
      }
      default_artist_view: {
        Row: {
          artist_name: string | null
          id: number | null
          report_key: string | null
          store_name: string | null
          visible: boolean | null
        }
        Relationships: []
      }
      default_commission_view: {
        Row: {
          artist_id: number | null
          artist_name: string | null
          commission: number | null
          store_id: number | null
          store_name: string | null
          year_month: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_commision_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_commision_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "default_artist_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_commision_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

