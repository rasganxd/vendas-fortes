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
      app_settings: {
        Row: {
          accent_color: string | null
          company_address: string | null
          company_document: string | null
          company_email: string | null
          company_footer: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string | null
          id: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          company_address?: string | null
          company_document?: string | null
          company_email?: string | null
          company_footer?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          company_address?: string | null
          company_document?: string | null
          company_email?: string | null
          company_footer?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          code: number
          created_at: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          visit_days: string[] | null
          visit_frequency: string | null
          visit_sequence: number | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: number
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          visit_days?: string[] | null
          visit_frequency?: string | null
          visit_sequence?: number | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: number
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          visit_days?: string[] | null
          visit_frequency?: string | null
          visit_sequence?: number | null
          zip?: string | null
        }
        Relationships: []
      }
      delivery_routes: {
        Row: {
          created_at: string | null
          date: string | null
          driver_id: string | null
          driver_name: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
          vehicle_name: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_routes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "sales_reps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      load_items: {
        Row: {
          customer_id: string | null
          id: string
          load_id: string | null
          order_id: string | null
          price: number | null
          product_code: number | null
          product_id: string | null
          product_name: string
          quantity: number
          total: number | null
        }
        Insert: {
          customer_id?: string | null
          id?: string
          load_id?: string | null
          order_id?: string | null
          price?: number | null
          product_code?: number | null
          product_id?: string | null
          product_name: string
          quantity: number
          total?: number | null
        }
        Update: {
          customer_id?: string | null
          id?: string
          load_id?: string | null
          order_id?: string | null
          price?: number | null
          product_code?: number | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "load_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_items_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      load_orders: {
        Row: {
          load_id: string
          order_id: string
        }
        Insert: {
          load_id: string
          order_id: string
        }
        Update: {
          load_id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "load_orders_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      loads: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          locked: boolean | null
          name: string
          notes: string | null
          sales_rep_id: string | null
          status: string | null
          total: number | null
          updated_at: string | null
          vehicle_id: string | null
          vehicle_name: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          locked?: boolean | null
          name: string
          notes?: string | null
          sales_rep_id?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          locked?: boolean | null
          name?: string
          notes?: string | null
          sales_rep_id?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loads_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "sales_reps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          discount: number | null
          id: string
          order_id: string | null
          price: number
          product_code: number
          product_id: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          discount?: number | null
          id?: string
          order_id?: string | null
          price: number
          product_code: number
          product_id?: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
        }
        Update: {
          discount?: number | null
          id?: string
          order_id?: string | null
          price?: number
          product_code?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          archived: boolean | null
          code: number
          created_at: string | null
          customer_id: string | null
          customer_name: string
          date: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_state: string | null
          delivery_zip: string | null
          discount: number | null
          due_date: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_method_id: string | null
          payment_status: string | null
          payment_table_id: string | null
          sales_rep_id: string | null
          sales_rep_name: string
          status: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          code: number
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          date?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_state?: string | null
          delivery_zip?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          payment_table_id?: string | null
          sales_rep_id?: string | null
          sales_rep_name: string
          status?: string | null
          total: number
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          code?: number
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          date?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_state?: string | null
          delivery_zip?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          payment_table_id?: string | null
          sales_rep_id?: string | null
          sales_rep_name?: string
          status?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payment_table_id_fkey"
            columns: ["payment_table_id"]
            isOneToOne: false
            referencedRelation: "payment_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "sales_reps"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_installments: {
        Row: {
          amount: number
          due_date: string
          id: string
          payment_id: string | null
        }
        Insert: {
          amount: number
          due_date: string
          id?: string
          payment_id?: string | null
        }
        Update: {
          amount?: number
          due_date?: string
          id?: string
          payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_installments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_table_installments: {
        Row: {
          days: number
          description: string | null
          id: string
          installment: number
          payment_table_id: string | null
          percentage: number
        }
        Insert: {
          days: number
          description?: string | null
          id?: string
          installment: number
          payment_table_id?: string | null
          percentage: number
        }
        Update: {
          days?: number
          description?: string | null
          id?: string
          installment?: number
          payment_table_id?: string | null
          percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_table_installments_payment_table_id_fkey"
            columns: ["payment_table_id"]
            isOneToOne: false
            referencedRelation: "payment_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_table_terms: {
        Row: {
          days: number
          description: string | null
          id: string
          installment: number
          payment_table_id: string | null
          percentage: number
        }
        Insert: {
          days: number
          description?: string | null
          id?: string
          installment: number
          payment_table_id?: string | null
          percentage: number
        }
        Update: {
          days?: number
          description?: string | null
          id?: string
          installment?: number
          payment_table_id?: string | null
          percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_table_terms_payment_table_id_fkey"
            columns: ["payment_table_id"]
            isOneToOne: false
            referencedRelation: "payment_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_tables: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          payable_to: string | null
          payment_location: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          payable_to?: string | null
          payment_location?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          payable_to?: string | null
          payment_location?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          amount_in_words: string | null
          created_at: string | null
          customer_address: string | null
          customer_document: string | null
          customer_name: string | null
          date: string | null
          due_date: string | null
          emission_location: string | null
          id: string
          method: string | null
          notes: string | null
          order_id: string | null
          payment_date: string | null
          payment_location: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_in_words?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_document?: string | null
          customer_name?: string | null
          date?: string | null
          due_date?: string | null
          emission_location?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_location?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_in_words?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_document?: string | null
          customer_name?: string | null
          date?: string | null
          due_date?: string | null
          emission_location?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_location?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_brands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          code: number
          cost: number | null
          created_at: string | null
          description: string | null
          group_id: string | null
          id: string
          max_discount_percentage: number | null
          min_stock: number | null
          name: string
          price: number
          stock: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          code: number
          cost?: number | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          max_discount_percentage?: number | null
          min_stock?: number | null
          name: string
          price: number
          stock?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          code?: number
          cost?: number | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          max_discount_percentage?: number | null
          min_stock?: number | null
          name?: string
          price?: number
          stock?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          address: string | null
          city: string | null
          completed: boolean | null
          customer_id: string | null
          customer_name: string
          id: string
          lat: number | null
          lng: number | null
          order_id: string | null
          route_id: string | null
          sequence: number
          state: string | null
          status: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          completed?: boolean | null
          customer_id?: string | null
          customer_name: string
          id?: string
          lat?: number | null
          lng?: number | null
          order_id?: string | null
          route_id?: string | null
          sequence: number
          state?: string | null
          status?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          completed?: boolean | null
          customer_id?: string | null
          customer_name?: string
          id?: string
          lat?: number | null
          lng?: number | null
          order_id?: string | null
          route_id?: string | null
          sequence?: number
          state?: string | null
          status?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "delivery_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_reps: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          code: number | null
          created_at: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          region: string | null
          role: string | null
          state: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          code?: number | null
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          region?: string | null
          role?: string | null
          state?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          code?: number | null
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          region?: string | null
          role?: string | null
          state?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          active: boolean | null
          capacity: number | null
          created_at: string | null
          driver_name: string | null
          id: string
          license_plate: string | null
          model: string | null
          name: string
          notes: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          capacity?: number | null
          created_at?: string | null
          driver_name?: string | null
          id?: string
          license_plate?: string | null
          model?: string | null
          name: string
          notes?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          capacity?: number | null
          created_at?: string | null
          driver_name?: string | null
          id?: string
          license_plate?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
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
