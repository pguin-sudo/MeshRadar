import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Node, Channel, Message, ConnectionStatus, ChatTarget, TracerouteResult, OpenTab } from '@/types'

// Helper to generate tab id from ChatTarget
export function getChatKey(target: ChatTarget): string {
  return target.type === 'channel' ? `channel:${target.index}` : `dm:${target.nodeId}`
}

interface MeshState {
  // Connection
  status: ConnectionStatus
  setStatus: (status: ConnectionStatus) => void

  // Nodes
  nodes: Node[]
  setNodes: (nodes: Node[]) => void
  updateNode: (node: Node) => void

  // Channels
  channels: Channel[]
  setChannels: (channels: Channel[]) => void

  // Messages
  messages: Message[]
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  updateMessageAck: (packetId: number, status: Message['ack_status']) => void

  // Current chat target
  currentChat: ChatTarget | null
  setCurrentChat: (target: ChatTarget | null) => void

  // Traceroute
  tracerouteResult: TracerouteResult | null
  setTracerouteResult: (result: TracerouteResult | null) => void

  // Selected node for info panel
  selectedNode: Node | null
  setSelectedNode: (node: Node | null) => void

  // Notifications
  unreadCount: number
  incrementUnread: () => void
  resetUnread: () => void

  // Unread messages per chat
  unreadPerChat: Record<string, number>
  incrementUnreadForChat: (chatKey: string) => void
  resetUnreadForChat: (chatKey: string) => void
  getUnreadForChat: (chatKey: string) => number

  // Open tabs (persisted in localStorage)
  openTabs: OpenTab[]
  addTab: (target: ChatTarget) => void
  removeTab: (tabId: string) => void
  setActiveTab: (target: ChatTarget) => void
}

export const useMeshStore = create<MeshState>()(
  persist(
    (set, get) => ({
  status: { connected: false },
  setStatus: (status) => set({ status }),

  nodes: [],
  setNodes: (nodes) => set({ nodes }),
  updateNode: (node) =>
    set((state) => {
      const idx = state.nodes.findIndex((n) => n.id === node.id || n.num === node.num)
      // Preserve existing position if update doesn't include coordinates
      const incoming = { ...node }
      if (incoming.position === undefined || incoming.position === null) {
        delete incoming.position
      }
      if (idx >= 0) {
        const newNodes = [...state.nodes]
        newNodes[idx] = { ...newNodes[idx], ...incoming }
        return { nodes: newNodes }
      }
      return { nodes: [...state.nodes, incoming] }
    }),

  channels: [],
  setChannels: (channels) => set({ channels }),

  messages: [],
  addMessage: (message) =>
    set((state) => {
      const existingIdx = message.packet_id
        ? state.messages.findIndex((m) => m.packet_id === message.packet_id)
        : -1

      if (existingIdx >= 0) {
        const messages = [...state.messages]
        messages[existingIdx] = { ...messages[existingIdx], ...message }
        return { messages }
      }

      if (state.messages.some((m) => m.id === message.id)) {
        return state
      }

      return { messages: [...state.messages, message] }
    }),
  setMessages: (messages) => set({ messages }),
  updateMessageAck: (packetId, ackStatus) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.packet_id === packetId ? { ...m, ack_status: ackStatus } : m
      ),
    })),

  currentChat: null,
  setCurrentChat: (target) => set({ currentChat: target }),

  tracerouteResult: null,
  setTracerouteResult: (result) => set({ tracerouteResult: result }),

  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),

  unreadCount: 0,
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0, unreadPerChat: {} }),

  unreadPerChat: {},
  incrementUnreadForChat: (chatKey) =>
    set((state) => {
      const current = state.unreadPerChat[chatKey] || 0
      return {
        unreadPerChat: {
          ...state.unreadPerChat,
          [chatKey]: current + 1,
        },
        unreadCount: state.unreadCount + 1,
      }
    }),
  resetUnreadForChat: (chatKey) =>
    set((state) => {
      const unreadForChat = state.unreadPerChat[chatKey] || 0
      const { [chatKey]: _, ...rest } = state.unreadPerChat
      return {
        unreadPerChat: rest,
        unreadCount: Math.max(0, state.unreadCount - unreadForChat),
      }
    }),
  getUnreadForChat: (chatKey: string): number => {
    return get().unreadPerChat[chatKey] || 0
  },

  // Tabs management
  openTabs: [],
  addTab: (target) =>
    set((state) => {
      const tabId = getChatKey(target)
      // Don't add if already exists
      if (state.openTabs.some((t) => t.id === tabId)) {
        return state
      }
      return {
        openTabs: [...state.openTabs, { id: tabId, target }],
      }
    }),
  removeTab: (tabId) =>
    set((state) => {
      const newTabs = state.openTabs.filter((t) => t.id !== tabId)
      // If closing current tab, switch to last remaining tab or null
      const currentKey = state.currentChat ? getChatKey(state.currentChat) : null
      if (currentKey === tabId) {
        const lastTab = newTabs[newTabs.length - 1]
        return {
          openTabs: newTabs,
          currentChat: lastTab ? lastTab.target : null,
        }
      }
      return { openTabs: newTabs }
    }),
  setActiveTab: (target) =>
    set((state) => {
      const tabId = getChatKey(target)
      // Add tab if not exists, then set as current
      const exists = state.openTabs.some((t) => t.id === tabId)
      return {
        openTabs: exists ? state.openTabs : [...state.openTabs, { id: tabId, target }],
        currentChat: target,
      }
    }),
  }),
  {
    name: 'meshtastic-tabs',
    partialize: (state) => ({ openTabs: state.openTabs }),
  }
))
