export type UserRole = 'Admin' | 'Member'

export interface AttachmentItem {
  kind: 'file' | 'link'
  label: string
  url?: string | null
  storage_path?: string | null
  mime_type?: string | null
}
export type FeatureStatus = 'Idea' | 'Planned' | 'In Progress' | 'Completed'
export type SubtaskStatus = 'Idea' | 'In Progress' | 'Completed'
export type FeaturePriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type FeaturePlatform = 'Website' | 'App' | 'Both'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: UserRole
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: UserRole
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          full_name?: string
          email?: string
          role?: UserRole
          avatar_url?: string | null
        }
      }
      feature_categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
        }
      }
      features: {
        Row: {
          id: string
          title: string
          description: string | null
          status: FeatureStatus
          priority: FeaturePriority
          platform: FeaturePlatform
          web_status: FeatureStatus | null
          app_status: FeatureStatus | null
          category_id: string | null
          assignee_id: string | null
          target_release: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: FeatureStatus
          priority?: FeaturePriority
          platform?: FeaturePlatform
          web_status?: FeatureStatus | null
          app_status?: FeatureStatus | null
          category_id?: string | null
          assignee_id?: string | null
          target_release?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: FeatureStatus
          priority?: FeaturePriority
          platform?: FeaturePlatform
          web_status?: FeatureStatus | null
          app_status?: FeatureStatus | null
          category_id?: string | null
          assignee_id?: string | null
          target_release?: string | null
          updated_at?: string
        }
      }
      feature_votes: {
        Row: {
          feature_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          feature_id: string
          user_id: string
          created_at?: string
        }
        Update: never
      }
      feature_comments: {
        Row: {
          id: string
          feature_id: string
          user_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          user_id: string
          body: string
          created_at?: string
        }
        Update: {
          body?: string
        }
      }
      feature_subtasks: {
        Row: {
          id: string
          feature_id: string
          title: string
          status: SubtaskStatus
          is_done: boolean
          sort_order: number
          assignee_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          title: string
          status?: SubtaskStatus
          is_done?: boolean
          sort_order?: number
          assignee_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          status?: SubtaskStatus
          is_done?: boolean
          sort_order?: number
          assignee_id?: string | null
          updated_at?: string
        }
      }
      feature_attachments: {
        Row: {
          id: string
          feature_id: string
          /** JSON array of AttachmentItem objects */
          items: AttachmentItem[]
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          items: AttachmentItem[]
          uploaded_by: string
          created_at?: string
        }
        Update: {
          items?: AttachmentItem[]
        }
      }
      feature_docs: {
        Row: {
          id: string
          feature_id: string
          body: string
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          body?: string
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          updated_by?: string | null
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          feature_id: string | null
          type: string
          title: string
          body: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature_id?: string | null
          type: string
          title: string
          body?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          read_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
    }
    Enums: {
      user_role: UserRole
      feature_status: FeatureStatus
      feature_priority: FeaturePriority
    }
  }
}
