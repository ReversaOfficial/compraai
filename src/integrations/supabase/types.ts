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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banner_bookings: {
        Row: {
          banner_position: string
          created_at: string
          duration_days: number
          ends_at: string
          id: string
          image_url: string | null
          link_url: string | null
          price_paid: number
          starts_at: string
          status: string
          store_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          banner_position?: string
          created_at?: string
          duration_days: number
          ends_at: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          price_paid?: number
          starts_at?: string
          status?: string
          store_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          banner_position?: string
          created_at?: string
          duration_days?: number
          ends_at?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          price_paid?: number
          starts_at?: string
          status?: string
          store_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banner_bookings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_pricing: {
        Row: {
          created_at: string
          duration_days: number
          id: string
          is_active: boolean | null
          position: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_days: number
          id?: string
          is_active?: boolean | null
          position?: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          id?: string
          is_active?: boolean | null
          position?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string | null
          position: string | null
          sort_order: number | null
          store_name: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          sort_order?: number | null
          store_name?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          sort_order?: number | null
          store_name?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_message_at: string | null
          product_id: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_message_at?: string | null
          product_id?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_message_at?: string | null
          product_id?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_payouts: {
        Row: {
          courier_id: string
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          paid_at: string | null
          payout_date: string
          platform_fee_total: number
          status: string
          total_deliveries: number
          updated_at: string
        }
        Insert: {
          courier_id: string
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          paid_at?: string | null
          payout_date?: string
          platform_fee_total?: number
          status?: string
          total_deliveries?: number
          updated_at?: string
        }
        Update: {
          courier_id?: string
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          paid_at?: string | null
          payout_date?: string
          platform_fee_total?: number
          status?: string
          total_deliveries?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courier_payouts_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
        ]
      }
      couriers: {
        Row: {
          city: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          neighborhoods: string[]
          operational_status: string
          phone: string
          updated_at: string
          user_id: string | null
          vehicle_type: string
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          neighborhoods?: string[]
          operational_status?: string
          phone?: string
          updated_at?: string
          user_id?: string | null
          vehicle_type?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          neighborhoods?: string[]
          operational_status?: string
          phone?: string
          updated_at?: string
          user_id?: string | null
          vehicle_type?: string
        }
        Relationships: []
      }
      delivery_orders: {
        Row: {
          accepted_at: string | null
          cancelled_at: string | null
          city: string
          courier_id: string | null
          courier_net_amount: number
          created_at: string
          customer_id: string
          delivered_at: string | null
          delivery_address: string
          freight_value: number
          id: string
          in_route_at: string | null
          neighborhood: string
          order_id: string
          paid_at: string | null
          picked_up_at: string | null
          pickup_address: string
          platform_fee_amount: number
          platform_fee_percent: number
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          cancelled_at?: string | null
          city?: string
          courier_id?: string | null
          courier_net_amount?: number
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          delivery_address?: string
          freight_value?: number
          id?: string
          in_route_at?: string | null
          neighborhood?: string
          order_id: string
          paid_at?: string | null
          picked_up_at?: string | null
          pickup_address?: string
          platform_fee_amount?: number
          platform_fee_percent?: number
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          cancelled_at?: string | null
          city?: string
          courier_id?: string | null
          courier_net_amount?: number
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          delivery_address?: string
          freight_value?: number
          id?: string
          in_route_at?: string | null
          neighborhood?: string
          order_id?: string
          paid_at?: string | null
          picked_up_at?: string | null
          pickup_address?: string
          platform_fee_amount?: number
          platform_fee_percent?: number
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          city: string
          created_at: string
          id: string
          is_active: boolean | null
          neighborhood: string
          price: number
          state: string
          store_id: string
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          neighborhood?: string
          price?: number
          state?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          neighborhood?: string
          price?: number
          state?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_zones_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      entregaai_settings: {
        Row: {
          base_price: number
          city: string
          created_at: string
          id: string
          is_active: boolean | null
          neighborhood: string
          platform_fee_percent: number
          state: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          neighborhood?: string
          platform_fee_percent?: number
          state?: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          neighborhood?: string
          platform_fee_percent?: number
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_change_logs: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_value: number
          previous_value: number
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_value: number
          previous_value: number
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_value?: number
          previous_value?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          link: string | null
          target_user_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          target_user_id?: string | null
          title: string
          type?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          target_user_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          store_id: string
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          quantity?: number
          store_id: string
          subtotal?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          store_id?: string
          subtotal?: number
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
          {
            foreignKeyName: "order_items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_full: string | null
          created_at: string
          customer_id: string
          delivery_method: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          platform_fee: number
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address_full?: string | null
          created_at?: string
          customer_id: string
          delivery_method?: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string
          platform_fee?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address_full?: string | null
          created_at?: string
          customer_id?: string
          delivery_method?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          platform_fee?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_splits: {
        Row: {
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          order_id: string
          payment_id: string
          platform_fee_amount: number
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id: string
          payment_id: string
          platform_fee_amount?: number
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string
          payment_id?: string
          platform_fee_amount?: number
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_splits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_splits_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_splits_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          approved_at: string | null
          cancelled_at: string | null
          created_at: string
          gateway_reference: string | null
          id: string
          method: string
          order_id: string
          refunded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          gateway_reference?: string | null
          id?: string
          method?: string
          order_id: string
          refunded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          gateway_reference?: string | null
          id?: string
          method?: string
          order_id?: string
          refunded_at?: string | null
          status?: string
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
        ]
      }
      payouts: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          failed_at: string | null
          gateway_reference: string | null
          id: string
          payment_split_id: string
          processed_at: string | null
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          failed_at?: string | null
          gateway_reference?: string | null
          id?: string
          payment_split_id: string
          processed_at?: string | null
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          failed_at?: string | null
          gateway_reference?: string | null
          id?: string
          payment_split_id?: string
          processed_at?: string | null
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_payment_split_id_fkey"
            columns: ["payment_split_id"]
            isOneToOne: false
            referencedRelation: "payment_splits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_ads: {
        Row: {
          body: string | null
          button_link: string | null
          button_text: string | null
          created_at: string
          created_by: string | null
          ends_at: string | null
          frequency: string
          id: string
          image_url: string | null
          is_active: boolean | null
          starts_at: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          frequency?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          starts_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          frequency?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          starts_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_promotions: {
        Row: {
          created_at: string
          duration_days: number
          ends_at: string
          id: string
          price_paid: number
          product_id: string
          starts_at: string
          status: string
          store_id: string
        }
        Insert: {
          created_at?: string
          duration_days: number
          ends_at: string
          id?: string
          price_paid?: number
          product_id: string
          starts_at?: string
          status?: string
          store_id: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          ends_at?: string
          id?: string
          price_paid?: number
          product_id?: string
          starts_at?: string
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_promotions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_visible: boolean | null
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allows_delivery: boolean | null
          allows_entregaai: boolean | null
          allows_pickup: boolean | null
          avg_rating: number | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          price: number
          promo_price: number | null
          review_count: number | null
          sold_count: number | null
          stock: number | null
          store_id: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          allows_delivery?: boolean | null
          allows_entregaai?: boolean | null
          allows_pickup?: boolean | null
          avg_rating?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          price?: number
          promo_price?: number | null
          review_count?: number | null
          sold_count?: number | null
          stock?: number | null
          store_id: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          allows_delivery?: boolean | null
          allows_entregaai?: boolean | null
          allows_pickup?: boolean | null
          avg_rating?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          price?: number
          promo_price?: number | null
          review_count?: number | null
          sold_count?: number | null
          stock?: number | null
          store_id?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_pricing: {
        Row: {
          created_at: string
          duration_days: number
          id: string
          is_active: boolean | null
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_days: number
          id?: string
          is_active?: boolean | null
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          id?: string
          is_active?: boolean | null
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      recent_searches: {
        Row: {
          created_at: string
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          accent_color: string | null
          footer_text: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          language: string | null
          platform_fee_percent: number
          primary_color: string | null
          site_description: string | null
          site_name: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          footer_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          language?: string | null
          platform_fee_percent?: number
          primary_color?: string | null
          site_description?: string | null
          site_name?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          footer_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          language?: string | null
          platform_fee_percent?: number
          primary_color?: string | null
          site_description?: string | null
          site_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_bank_accounts: {
        Row: {
          account_number: string
          account_type: string
          agency: string
          bank_code: string
          bank_name: string
          created_at: string
          holder_document: string
          holder_name: string
          id: string
          is_active: boolean | null
          pix_key: string | null
          pix_key_type: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          account_number?: string
          account_type?: string
          agency?: string
          bank_code?: string
          bank_name?: string
          created_at?: string
          holder_document?: string
          holder_name?: string
          id?: string
          is_active?: boolean | null
          pix_key?: string | null
          pix_key_type?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          account_number?: string
          account_type?: string
          agency?: string
          bank_code?: string
          bank_name?: string
          created_at?: string
          holder_document?: string
          holder_name?: string
          id?: string
          is_active?: boolean | null
          pix_key?: string | null
          pix_key_type?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_bank_accounts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_favorites: {
        Row: {
          created_at: string
          id: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_favorites_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_visible: boolean | null
          rating: number
          store_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          rating: number
          store_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          rating?: number
          store_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_views: {
        Row: {
          id: string
          store_id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          store_id: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          store_id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_views_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          avg_rating: number | null
          banner_url: string | null
          category: string | null
          created_at: string
          description: string | null
          hours: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          plan: string | null
          plan_limit: number | null
          review_count: number | null
          slug: string
          social_facebook: string | null
          social_instagram: string | null
          total_sales: number | null
          total_views: number | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          avg_rating?: number | null
          banner_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          hours?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          plan_limit?: number | null
          review_count?: number | null
          slug: string
          social_facebook?: string | null
          social_instagram?: string | null
          total_sales?: number | null
          total_views?: number | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          avg_rating?: number | null
          banner_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          hours?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          plan_limit?: number | null
          review_count?: number | null
          slug?: string
          social_facebook?: string | null
          social_instagram?: string | null
          total_sales?: number | null
          total_views?: number | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      transaction_logs: {
        Row: {
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          event: string
          id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          event: string
          id?: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          event?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
