import { supabase } from '../lib/supabase'
import { ChatMessage } from '../types'

export class ChatService {
  static async getConversation(userId: string, otherUserId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('timestamp', { ascending: true })

    if (error) throw error

    return data.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      recipientId: msg.recipient_id,
      text: msg.text,
      audioUrl: msg.audio_url,
      timestamp: msg.timestamp,
      isRead: msg.is_read,
      isUrgent: msg.is_urgent
    }))
  }

  static async getAllConversations(userId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('timestamp', { ascending: false })

    if (error) throw error

    return data.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      recipientId: msg.recipient_id,
      text: msg.text,
      audioUrl: msg.audio_url,
      timestamp: msg.timestamp,
      isRead: msg.is_read,
      isUrgent: msg.is_urgent
    }))
  }

  static async sendMessage(senderId: string, recipientId: string, text: string, isUrgent: boolean = false) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        text,
        is_urgent: isUrgent,
        is_read: false
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      senderId: data.sender_id,
      recipientId: data.recipient_id,
      text: data.text,
      audioUrl: data.audio_url,
      timestamp: data.timestamp,
      isRead: data.is_read,
      isUrgent: data.is_urgent
    } as ChatMessage
  }

  static async markMessageAsRead(messageId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId)

    if (error) throw error
  }

  static async markConversationAsRead(userId: string, otherUserId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('sender_id', otherUserId)
      .eq('recipient_id', userId)
      .eq('is_read', false)

    if (error) throw error
  }

  static subscribeToMessages(userId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          const msg = payload.new as any
          callback({
            id: msg.id,
            senderId: msg.sender_id,
            recipientId: msg.recipient_id,
            text: msg.text,
            audioUrl: msg.audio_url,
            timestamp: msg.timestamp,
            isRead: msg.is_read,
            isUrgent: msg.is_urgent
          })
        }
      )
      .subscribe()
  }

  static async getUnreadMessageCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  }

  static async getUrgentMessageCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_urgent', true)
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  }
}