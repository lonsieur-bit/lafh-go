export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          display_name: string | null;
          role: "rider" | "captain" | "admin" | "employee";
          referral_code: string | null;
          disabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      employee_permissions: {
        Row: {
          profile_id: string;
          can_manage_trips: boolean;
          can_manage_cards: boolean;
          can_manage_users: boolean;
        };
        Insert: Database["public"]["Tables"]["employee_permissions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["employee_permissions"]["Row"]>;
      };
      orders: {
        Row: {
          id: string;
          display_id: string;
          rider_id: string | null;
          captain_id: string | null;
          driver_id: string | null;
          from_location: string;
          to_location: string;
          trip_date: string | null;
          trip_time: string | null;
          price_sar: number | null;
          status: "pending" | "active" | "completed" | "cancelled";
          status_label: string | null;
          rating: number;
          service_type: "regular" | "premium" | "family" | "bike" | "cargo" | "tow";
          service_label: string | null;
          discount_sar: number | null;
          total_sar: number | null;
          payment_method: string | null;
          pickup_lat: number | null;
          pickup_lng: number | null;
          dropoff_lat: number | null;
          dropoff_lng: number | null;
          captain_net_sar: number | null;
          captain_quote_sar: number | null;
          freight_notes: string | null;
          rider_confirmed_match: boolean;
          captain_confirmed_match: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          id: string;
          display_id: string;
          from_location: string;
          to_location: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      order_timeline_steps: {
        Row: {
          id: string;
          order_id: string;
          sort_order: number;
          title: string;
          step_time: string | null;
          done: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["order_timeline_steps"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["order_timeline_steps"]["Row"]>;
      };
      order_receipt_lines: {
        Row: {
          id: string;
          order_id: string;
          sort_order: number;
          label: string;
          amount: string;
        };
        Insert: Omit<Database["public"]["Tables"]["order_receipt_lines"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["order_receipt_lines"]["Row"]>;
      };
      order_messages: {
        Row: {
          id: string;
          order_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          order_id: string;
          sender_id: string;
          body: string;
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_messages"]["Row"]>;
      };
      wallets: {
        Row: { profile_id: string; balance_sar: number; updated_at: string };
        Insert: { profile_id: string; balance_sar?: number };
        Update: Partial<Database["public"]["Tables"]["wallets"]["Row"]>;
      };
      wallet_transactions: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          subtitle: string | null;
          amount_sar: number;
          positive: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wallet_transactions"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wallet_transactions"]["Row"]>;
      };
      partner_stores: {
        Row: {
          id: string;
          name: string;
          area: string | null;
          contact_phone: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["partner_stores"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["partner_stores"]["Row"]>;
      };
      gift_card_batches: {
        Row: {
          id: string;
          store_id: string;
          label: string;
          amount_sar: number;
          quantity: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gift_card_batches"]["Row"], "id" | "created_at"> & {
          store_id: string;
          label: string;
          amount_sar: number;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["gift_card_batches"]["Row"]>;
      };
      recharge_cards: {
        Row: {
          id: string;
          code: string;
          amount_sar: number;
          status: "new" | "used";
          used_by: string | null;
          used_at: string | null;
          created_at: string;
          batch_id: string | null;
          store_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["recharge_cards"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["recharge_cards"]["Row"]>;
      };
      saved_addresses: {
        Row: {
          id: string;
          profile_id: string;
          label: string;
          detail: string;
          is_default: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["saved_addresses"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["saved_addresses"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          body: string;
          time_label: string | null;
          read: boolean;
          notif_group: "today" | "earlier";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      referrals: {
        Row: {
          id: string;
          inviter_id: string | null;
          invitee_id: string | null;
          referral_code: string | null;
          reward_sar: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["referrals"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["referrals"]["Row"]>;
      };
      referral_program_settings: {
        Row: {
          id: string;
          default_reward_sar: number;
          invitee_bonus_sar: number;
          enabled: boolean;
          description_ar: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          default_reward_sar?: number;
          invitee_bonus_sar?: number;
          enabled?: boolean;
          description_ar?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["referral_program_settings"]["Insert"]>;
      };
      cargo_requests: {
        Row: {
          id: string;
          rider_id: string | null;
          from_location: string | null;
          to_location: string | null;
          description: string | null;
          status: "pending" | "assigned" | "completed" | "cancelled";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cargo_requests"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["cargo_requests"]["Row"]>;
      };
      drivers: {
        Row: {
          id: string;
          profile_id: string | null;
          name_ar: string;
          name_en: string | null;
          rating: number;
          trips_count: number;
          car_model: string | null;
          plate: string | null;
          avatar_color: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["drivers"]["Row"]> & { name_ar: string };
        Update: Partial<Database["public"]["Tables"]["drivers"]["Row"]>;
      };
      push_tokens: {
        Row: {
          id: string;
          profile_id: string;
          token: string;
          platform: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["push_tokens"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["push_tokens"]["Row"]>;
      };
      captain_sessions: {
        Row: {
          profile_id: string;
          online: boolean;
          offline_alerts_enabled: boolean;
          last_seen: string;
          lat: number | null;
          lng: number | null;
          heading: number | null;
        };
        Insert: Database["public"]["Tables"]["captain_sessions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["captain_sessions"]["Row"]>;
      };
      platform_settings: {
        Row: {
          id: string;
          display_currency: "SAR" | "USD" | "SYP";
          usd_per_sar: number;
          syp_per_sar: number;
          app_enabled: boolean;
          maintenance_message_ar: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          display_currency: "SAR" | "USD" | "SYP";
          usd_per_sar: number;
          syp_per_sar: number;
          app_enabled?: boolean;
          maintenance_message_ar?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["platform_settings"]["Insert"]>;
      };
      support_submissions: {
        Row: {
          id: string;
          profile_id: string | null;
          name: string;
          phone: string | null;
          category: string;
          subject: string | null;
          message: string;
          status: "new" | "read" | "resolved";
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          name: string;
          phone?: string | null;
          category: string;
          subject?: string | null;
          message: string;
          status?: "new" | "read" | "resolved";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["support_submissions"]["Insert"]>;
      };
      service_config: {
        Row: {
          service_type: "regular" | "premium" | "family" | "bike" | "cargo" | "tow";
          base_fare_sar: number;
          label_ar: string;
          door_fee_sar: number;
          km_rate_sar: number;
          wait_minute_rate_sar: number;
          min_fare_sar: number;
        };
        Insert: Database["public"]["Tables"]["service_config"]["Row"];
        Update: Partial<Database["public"]["Tables"]["service_config"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      has_employee_permission: { Args: { perm: string }; Returns: boolean };
      redeem_gift_card: { Args: { p_code: string }; Returns: number };
      rider_wallet_apply: {
        Args: {
          p_amount_sar: number;
          p_positive: boolean;
          p_title: string;
          p_subtitle?: string;
        };
        Returns: number;
      };
      apply_referral_code: { Args: { p_code: string }; Returns: boolean };
      lookup_referral_code: {
        Args: { p_code: string };
        Returns: { profile_id: string; referral_code: string }[];
      };
      captain_set_online: {
        Args: {
          p_online: boolean;
          p_lat?: number | null;
          p_lng?: number | null;
          p_offline_alerts?: boolean | null;
        };
        Returns: undefined;
      };
      captain_accept_order: { Args: { p_order_id: string }; Returns: Database["public"]["Tables"]["orders"]["Row"] };
      cancel_order: { Args: { p_order_id: string }; Returns: Database["public"]["Tables"]["orders"]["Row"] };
      submit_support_message: {
        Args: {
          p_name: string;
          p_phone?: string | null;
          p_category?: string | null;
          p_subject?: string | null;
          p_message?: string | null;
        };
        Returns: Database["public"]["Tables"]["support_submissions"]["Row"];
      };
      captain_update_trip_status: {
        Args: { p_order_id: string; p_status_label: string; p_step_title: string };
        Returns: undefined;
      };
      captain_complete_trip: { Args: { p_order_id: string }; Returns: number };
      captain_freight_respond: {
        Args: { p_order_id: string; p_use_rider_price: boolean; p_quote_sar?: number | null };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      rider_freight_confirm: {
        Args: { p_order_id: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
    };
    Enums: Record<string, never>;
  };
};
