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
          artist_name: string | null
          id: number
          report_key: string | null
          visible: boolean
        }
        Insert: {
          artist_name?: string | null
          id?: never
          report_key?: string | null
          visible?: boolean
        }
        Update: {
          artist_name?: string | null
          id?: never
          report_key?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      artist_payment_status: {
        Row: {
          artist_id: number | null
          id: number
          process_state: Database["public"]["Enums"]["processenum"] | null
          year_month: string
        }
        Insert: {
          artist_id?: number | null
          id?: never
          process_state?: Database["public"]["Enums"]["processenum"] | null
          year_month: string
        }
        Update: {
          artist_id?: number | null
          id?: never
          process_state?: Database["public"]["Enums"]["processenum"] | null
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_payment_status_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          create_time: string
          edit_time: string
          id: number
          title: string
        }
        Insert: {
          content?: string
          create_time?: string
          edit_time?: string
          id?: never
          title?: string
        }
        Update: {
          content?: string
          create_time?: string
          edit_time?: string
          id?: never
          title?: string
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
          state: string | null
          trade_date: string | null
          trade_id: string
        }
        Insert: {
          state?: string | null
          trade_date?: string | null
          trade_id: string
        }
        Update: {
          state?: string | null
          trade_date?: string | null
          trade_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      processenum: "todo" | "doing" | "done"
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

