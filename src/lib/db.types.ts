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
      get_total_trade: {
        Args: {
          artist_id: number
          start_date: string
          end_date: string
        }
        Returns: Record<string, unknown>
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

