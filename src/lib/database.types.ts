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
      notification_outbox: {
        Row: {
          id: string
          report_id: string
          history_id: string
          channel: "email" | "whatsapp"
          recipient: string
          message: string
          status: "pending" | "processing" | "sent" | "failed"
          attempts: number
          error_message: string | null
          created_at: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          report_id: string
          history_id: string
          channel: "email" | "whatsapp"
          recipient: string
          message: string
          status?: "pending" | "processing" | "sent" | "failed"
          attempts?: number
          error_message?: string | null
          created_at?: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          report_id?: string
          history_id?: string
          channel?: "email" | "whatsapp"
          recipient?: string
          message?: string
          status?: "pending" | "processing" | "sent" | "failed"
          attempts?: number
          error_message?: string | null
          created_at?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_history_id_fkey"
            columns: ["history_id"]
            isOneToOne: false
            referencedRelation: "report_status_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_outbox_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          }
        ]
      }
      report_assignments: {
        Row: {
          id: string
          report_id: string
          officer_id: string
          assigned_by: string
          priority: "low" | "medium" | "high"
          deadline: string | null
          status: "assigned" | "in_progress" | "submitted" | "completed" | "cancelled"
          notes: string | null
          assigned_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          officer_id: string
          assigned_by: string
          priority?: "low" | "medium" | "high"
          deadline?: string | null
          status?: "assigned" | "in_progress" | "submitted" | "completed" | "cancelled"
          notes?: string | null
          assigned_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          officer_id?: string
          assigned_by?: string
          priority?: "low" | "medium" | "high"
          deadline?: string | null
          status?: "assigned" | "in_progress" | "submitted" | "completed" | "cancelled"
          notes?: string | null
          assigned_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_assignments_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_assignments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          }
        ]
      }
      report_code_counters: {
        Row: {
          report_year: number
          last_number: number
        }
        Insert: {
          report_year: number
          last_number?: number
        }
        Update: {
          report_year?: number
          last_number?: number
        }
        Relationships: []
      }
      report_handling_photos: {
        Row: {
          id: string
          result_id: string
          storage_path: string
          file_name: string | null
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          result_id: string
          storage_path: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          result_id?: string
          storage_path?: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_handling_photos_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "report_handling_results"
            referencedColumns: ["id"]
          }
        ]
      }
      report_handling_results: {
        Row: {
          id: string
          assignment_id: string
          report_id: string
          officer_id: string
          description: string
          status: "pending_review" | "approved" | "revision_requested"
          submitted_at: string
          reviewed_by: string | null
          review_notes: string | null
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          assignment_id: string
          report_id: string
          officer_id: string
          description: string
          status?: "pending_review" | "approved" | "revision_requested"
          submitted_at?: string
          reviewed_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          assignment_id?: string
          report_id?: string
          officer_id?: string
          description?: string
          status?: "pending_review" | "approved" | "revision_requested"
          submitted_at?: string
          reviewed_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_handling_results_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "report_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_handling_results_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_handling_results_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_handling_results_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      report_photos: {
        Row: {
          id: string
          report_id: string
          storage_path: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          storage_path: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          storage_path?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_photos_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          }
        ]
      }
      report_reviews: {
        Row: {
          id: string
          report_id: string
          admin_id: string
          decision: "approved" | "rejected" | "revision"
          notes: string | null
          reviewed_at: string
        }
        Insert: {
          id?: string
          report_id: string
          admin_id: string
          decision: "approved" | "rejected" | "revision"
          notes?: string | null
          reviewed_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          admin_id?: string
          decision?: "approved" | "rejected" | "revision"
          notes?: string | null
          reviewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_reviews_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_reviews_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          }
        ]
      }
      report_status_history: {
        Row: {
          id: string
          report_id: string
          old_status: string | null
          new_status: "pending" | "revision" | "rejected" | "verified" | "assigned" | "in_progress" | "completed" | "closed"
          changed_by: string | null
          actor_role: "admin" | "verifikator" | "officer" | "system"
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          old_status?: string | null
          new_status: "pending" | "revision" | "rejected" | "verified" | "assigned" | "in_progress" | "completed" | "closed"
          changed_by?: string | null
          actor_role: "admin" | "verifikator" | "officer" | "system"
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          old_status?: string | null
          new_status?: "pending" | "revision" | "rejected" | "verified" | "assigned" | "in_progress" | "completed" | "closed"
          changed_by?: string | null
          actor_role?: "admin" | "verifikator" | "officer" | "system"
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_status_history_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          }
        ]
      }
      report_validation_results: {
        Row: {
          id: string
          report_id: string
          duplicate_detected: boolean
          spam_detected: boolean
          validation_notes: string[]
          checked_at: string
          created_at: string
          spam_checked: boolean
        }
        Insert: {
          id?: string
          report_id: string
          duplicate_detected?: boolean
          spam_detected?: boolean
          validation_notes?: string[]
          checked_at?: string
          created_at?: string
          spam_checked?: boolean
        }
        Update: {
          id?: string
          report_id?: string
          duplicate_detected?: boolean
          spam_detected?: boolean
          validation_notes?: string[]
          checked_at?: string
          created_at?: string
          spam_checked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "report_validation_results_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          reporter_name: string
          reporter_contact: string | null
          category: string
          title: string
          description: string
          incident_date: string
          province: string
          city: string
          district: string
          address: string
          latitude: number
          longitude: number
          privacy: string
          status: 'pending' | 'verified' | 'rejected'
          created_at: string
          report_code: string | null
          rejection_reason: string | null
          notification_consent: boolean
        }
        Insert: {
          id?: string
          reporter_name: string
          reporter_contact?: string | null
          category: string
          title: string
          description: string
          incident_date: string
          province: string
          city: string
          district: string
          address: string
          latitude: number
          longitude: number
          privacy?: string
          status?: string
          created_at?: string
          report_code?: string | null
          rejection_reason?: string | null
          notification_consent?: boolean
        }
        Update: {
          id?: string
          reporter_name?: string
          reporter_contact?: string | null
          category?: string
          title?: string
          description?: string
          incident_date?: string
          province?: string
          city?: string
          district?: string
          address?: string
          latitude?: number
          longitude?: number
          privacy?: string
          status?: string
          created_at?: string
          report_code?: string | null
          rejection_reason?: string | null
          notification_consent?: boolean
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: "superadmin" | "admin" | "verifikator" | "petugas"
          created_at: string
          phone: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: "superadmin" | "admin" | "verifikator" | "petugas"
          created_at?: string
          phone?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: "superadmin" | "admin" | "verifikator" | "petugas"
          created_at?: string
          phone?: string | null
          is_active?: boolean
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

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never