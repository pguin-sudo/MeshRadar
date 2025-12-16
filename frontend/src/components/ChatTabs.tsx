import { X, Hash, User } from 'lucide-react'
import { useMeshStore, getChatKey } from '@/store'
import { cn } from '@/lib/utils'

export function ChatTabs() {
  const openTabs = useMeshStore((s) => s.openTabs)
  const currentChat = useMeshStore((s) => s.currentChat)
  const setActiveTab = useMeshStore((s) => s.setActiveTab)
  const removeTab = useMeshStore((s) => s.removeTab)
  const unreadPerChat = useMeshStore((s) => s.unreadPerChat)

  const currentKey = currentChat ? getChatKey(currentChat) : null

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 min-h-[40px] border-b border-border bg-muted/30 overflow-x-auto">
      {openTabs.map((tab) => {
        const isActive = tab.id === currentKey
        const unreadCount = unreadPerChat[tab.id] || 0

        return (
          <div
            key={tab.id}
            className={cn(
              'group flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm',
              'hover:bg-accent/50',
              isActive
                ? 'bg-background shadow-sm border border-border'
                : 'text-muted-foreground'
            )}
            onClick={() => setActiveTab(tab.target)}
          >
            {tab.target.type === 'channel' ? (
              <Hash className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <User className="w-3.5 h-3.5 shrink-0" />
            )}

            <span className="truncate max-w-[120px]">{tab.target.name}</span>

            {/* Unread indicator */}
            {unreadCount > 0 && !isActive && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}

            {/* Close button */}
            <button
              className={cn(
                'ml-1 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-colors',
                'opacity-0 group-hover:opacity-100',
                isActive && 'opacity-100'
              )}
              onClick={(e) => {
                e.stopPropagation()
                removeTab(tab.id)
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
