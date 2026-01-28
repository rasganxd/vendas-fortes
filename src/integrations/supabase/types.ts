export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          email: string | null
          footer: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          footer?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          footer?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          code: number
          company_name: string | null
          created_at: string
          delivery_route_id: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          notes: string | null
          phone: string | null
          sales_rep_id: string | null
          sales_rep_name: string | null
          state: string | null
          sync_pending: boolean | null
          updated_at: string
          visit_days: string[] | null
          visit_frequency: string | null
          visit_sequence: number | null
          visit_sequences: Json | null
          zip: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          code: number
          company_name?: string | null
          created_at?: string
          delivery_route_id?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          state?: string | null
          sync_pending?: boolean | null
          updated_at?: string
          visit_days?: string[] | null
          visit_frequency?: string | null
          visit_sequence?: number | null
          visit_sequences?: Json | null
          zip?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          code?: number
          company_name?: string | null
          created_at?: string
          delivery_route_id?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          state?: string | null
          sync_pending?: boolean | null
          updated_at?: string
          visit_days?: string[] | null
          visit_frequency?: string | null
          visit_sequence?: number | null
          visit_sequences?: Json | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_delivery_route_id_fkey"
            columns: ["delivery_route_id"]
            isOneToOne: false
            referencedRelation: "delivery_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "sales_reps"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_routes: {
        Row: {
          active: boolean | null
          created_at: string
          date: string | null
          description: string | null
          driver_id: string | null
          driver_name: string | null
          id: string
          last_updated: string | null
          name: string
          sales_rep_id: string | null
          sales_rep_name: string | null
          status: string | null
          updated_at: string
          vehicle_id: string | null
          vehicle_name: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          date?: string | null
          description?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          last_updated?: string | null
          name: string
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          date?: string | null
          description?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          last_updated?: string | null
          name?: string
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_routes_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
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
      import_reports: {
        Row: {
          created_at: string
          id: string
          operation_type: string | null
          operator: string | null
          orders_count: number | null
          report_data: Json | null
          sales_reps_count: number | null
          timestamp: string | null
          total_value: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          operation_type?: string | null
          operator?: string | null
          orders_count?: number | null
          report_data?: Json | null
          sales_reps_count?: number | null
          timestamp?: string | null
          total_value?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          operation_type?: string | null
          operator?: string | null
          orders_count?: number | null
          report_data?: Json | null
          sales_reps_count?: number | null
          timestamp?: string | null
          total_value?: number | null
        }
        Relationships: []
      }
      load_items: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          load_id: string | null
          order_id: string | null
          order_item_id: string | null
          price: number | null
          product_code: number | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          status: string | null
          total: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          load_id?: string | null
          order_id?: string | null
          order_item_id?: string | null
          price?: number | null
          product_code?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          status?: string | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          load_id?: string | null
          order_id?: string | null
          order_item_id?: string | null
          price?: number | null
          product_code?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          status?: string | null
          total?: number | null
          updated_at?: string
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
      loads: {
        Row: {
          code: number | null
          created_at: string
          date: string | null
          delivery_date: string | null
          departure_date: string | null
          description: string | null
          driver_id: string | null
          driver_name: string | null
          id: string
          locked: boolean | null
          name: string
          notes: string | null
          order_ids: Json | null
          return_date: string | null
          route_id: string | null
          route_name: string | null
          sales_rep_id: string | null
          sales_rep_name: string | null
          status: string | null
          total: number | null
          updated_at: string
          vehicle_id: string | null
          vehicle_name: string | null
        }
        Insert: {
          code?: number | null
          created_at?: string
          date?: string | null
          delivery_date?: string | null
          departure_date?: string | null
          description?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          locked?: boolean | null
          name: string
          notes?: string | null
          order_ids?: Json | null
          return_date?: string | null
          route_id?: string | null
          route_name?: string | null
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Update: {
          code?: number | null
          created_at?: string
          date?: string | null
          delivery_date?: string | null
          departure_date?: string | null
          description?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          locked?: boolean | null
          name?: string
          notes?: string | null
          order_ids?: Json | null
          return_date?: string | null
          route_id?: string | null
          route_name?: string | null
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loads_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "delivery_routes"
            referencedColumns: ["id"]
          },
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
      maintenance_logs: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          operation: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          operation?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          operation?: string | null
          status?: string | null
        }
        Relationships: []
      }
      mobile_order_import: {
        Row: {
          created_at: string
          id: string
          imported_at: string | null
          imported_by: string | null
          order_data: Json | null
          sales_rep_id: string | null
          sales_rep_name: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          imported_at?: string | null
          imported_by?: string | null
          order_data?: Json | null
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          imported_at?: string | null
          imported_by?: string | null
          order_data?: Json | null
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          discount: number | null
          id: string
          order_id: string | null
          price: number | null
          product_code: number | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          total: number | null
          unit: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: number | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_code?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          total?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: number | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_code?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          total?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
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
          created_at: string
          customer_code: number | null
          customer_id: string | null
          customer_name: string | null
          date: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_date: string | null
          delivery_state: string | null
          delivery_zip: string | null
          discount: number | null
          due_date: string | null
          id: string
          import_status: string | null
          imported_at: string | null
          imported_by: string | null
          mobile_order_id: string | null
          notes: string | null
          payment_method: string | null
          payment_method_id: string | null
          payment_status: string | null
          payment_table: string | null
          payment_table_id: string | null
          rejection_reason: string | null
          sales_rep_id: string | null
          sales_rep_name: string | null
          source_project: string | null
          status: string | null
          total: number | null
          updated_at: string
          visit_notes: string | null
        }
        Insert: {
          archived?: boolean | null
          code: number
          created_at?: string
          customer_code?: number | null
          customer_id?: string | null
          customer_name?: string | null
          date?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_date?: string | null
          delivery_state?: string | null
          delivery_zip?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          import_status?: string | null
          imported_at?: string | null
          imported_by?: string | null
          mobile_order_id?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          payment_table?: string | null
          payment_table_id?: string | null
          rejection_reason?: string | null
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          source_project?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string
          visit_notes?: string | null
        }
        Update: {
          archived?: boolean | null
          code?: number
          created_at?: string
          customer_code?: number | null
          customer_id?: string | null
          customer_name?: string | null
          date?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_date?: string | null
          delivery_state?: string | null
          delivery_zip?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          import_status?: string | null
          imported_at?: string | null
          imported_by?: string | null
          mobile_order_id?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          payment_table?: string | null
          payment_table_id?: string | null
          rejection_reason?: string | null
          sales_rep_id?: string | null
          sales_rep_name?: string | null
          source_project?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string
          visit_notes?: string | null
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
      payment_methods: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          name: string
          notes: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_tables: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          installments: Json | null
          name: string
          notes: string | null
          payable_to: string | null
          payment_location: string | null
          terms: Json | null
          type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          installments?: Json | null
          name: string
          notes?: string | null
          payable_to?: string | null
          payment_location?: string | null
          terms?: Json | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          installments?: Json | null
          name?: string
          notes?: string | null
          payable_to?: string | null
          payment_location?: string | null
          terms?: Json | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          amount_in_words: string | null
          created_at: string
          customer_address: string | null
          customer_document: string | null
          customer_name: string | null
          date: string | null
          due_date: string | null
          emission_location: string | null
          id: string
          installments: Json | null
          last_sync_date: string | null
          method: string | null
          notes: string | null
          order_id: string | null
          payment_date: string | null
          payment_location: string | null
          sales_rep_id: string | null
          status: string | null
          synced_to_mobile: boolean | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          amount_in_words?: string | null
          created_at?: string
          customer_address?: string | null
          customer_document?: string | null
          customer_name?: string | null
          date?: string | null
          due_date?: string | null
          emission_location?: string | null
          id?: string
          installments?: Json | null
          last_sync_date?: string | null
          method?: string | null
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_location?: string | null
          sales_rep_id?: string | null
          status?: string | null
          synced_to_mobile?: boolean | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          amount_in_words?: string | null
          created_at?: string
          customer_address?: string | null
          customer_document?: string | null
          customer_name?: string | null
          date?: string | null
          due_date?: string | null
          emission_location?: string | null
          id?: string
          installments?: Json | null
          last_sync_date?: string | null
          method?: string | null
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_location?: string | null
          sales_rep_id?: string | null
          status?: string | null
          synced_to_mobile?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "sales_reps"
            referencedColumns: ["id"]
          },
        ]
      }
      product_brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          brand_id: string | null
          category_id: string | null
          code: number
          cost: number | null
          created_at: string
          description: string | null
          group_id: string | null
          has_subunit: boolean | null
          id: string
          main_unit_id: string | null
          max_discount_percent: number | null
          max_price: number | null
          min_stock: number | null
          name: string
          price: number | null
          sale_price: number | null
          stock: number | null
          sub_unit_id: string | null
          subunit: string | null
          subunit_ratio: number | null
          sync_status: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          brand_id?: string | null
          category_id?: string | null
          code: number
          cost?: number | null
          created_at?: string
          description?: string | null
          group_id?: string | null
          has_subunit?: boolean | null
          id?: string
          main_unit_id?: string | null
          max_discount_percent?: number | null
          max_price?: number | null
          min_stock?: number | null
          name: string
          price?: number | null
          sale_price?: number | null
          stock?: number | null
          sub_unit_id?: string | null
          subunit?: string | null
          subunit_ratio?: number | null
          sync_status?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          brand_id?: string | null
          category_id?: string | null
          code?: number
          cost?: number | null
          created_at?: string
          description?: string | null
          group_id?: string | null
          has_subunit?: boolean | null
          id?: string
          main_unit_id?: string | null
          max_discount_percent?: number | null
          max_price?: number | null
          min_stock?: number | null
          name?: string
          price?: number | null
          sale_price?: number | null
          stock?: number | null
          sub_unit_id?: string | null
          subunit?: string | null
          subunit_ratio?: number | null
          sync_status?: string | null
          unit?: string | null
          updated_at?: string
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
          {
            foreignKeyName: "products_main_unit_id_fkey"
            columns: ["main_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sub_unit_id_fkey"
            columns: ["sub_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          address: string | null
          city: string | null
          completed: boolean | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          id: string
          lat: number | null
          lng: number | null
          notes: string | null
          order_id: string | null
          position: number | null
          route_id: string | null
          sequence: number | null
          state: string | null
          status: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          completed?: boolean | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          order_id?: string | null
          position?: number | null
          route_id?: string | null
          sequence?: number | null
          state?: string | null
          status?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          completed?: boolean | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          order_id?: string | null
          position?: number | null
          route_id?: string | null
          sequence?: number | null
          state?: string | null
          status?: string | null
          updated_at?: string
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
          code: number
          created_at: string
          email: string | null
          id: string
          name: string
          password: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          code: number
          created_at?: string
          email?: string | null
          id?: string
          name: string
          password?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          code?: number
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          password?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_backups: {
        Row: {
          backup_data: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          size: number | null
          status: string | null
          type: string | null
        }
        Insert: {
          backup_data?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          size?: number | null
          status?: string | null
          type?: string | null
        }
        Update: {
          backup_data?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          size?: number | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          package_quantity: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          package_quantity?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          package_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          active: boolean | null
          brand: string | null
          capacity: number | null
          created_at: string
          driver_name: string | null
          id: string
          license_plate: string | null
          model: string | null
          name: string
          notes: string | null
          plate_number: string | null
          status: string | null
          type: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          active?: boolean | null
          brand?: string | null
          capacity?: number | null
          created_at?: string
          driver_name?: string | null
          id?: string
          license_plate?: string | null
          model?: string | null
          name: string
          notes?: string | null
          plate_number?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          active?: boolean | null
          brand?: string | null
          capacity?: number | null
          created_at?: string
          driver_name?: string | null
          id?: string
          license_plate?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          plate_number?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_sales_rep_code: { Args: never; Returns: number }
      hash_password: { Args: { password: string }; Returns: string }
      verify_password: {
        Args: { password: string; password_hash: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
