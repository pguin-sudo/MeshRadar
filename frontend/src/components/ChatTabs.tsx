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
    <div className="flex items-end gap-0 px-2 pt-2 min-h-[44px] bg-muted/50 overflow-x-auto">
      {openTabs.map((tab) => {
        const isActive = tab.id === currentKey
        const unreadCount = unreadPerChat[tab.id] || 0

        return (
          <div
            key={tab.id}
            className={cn(
              'group flex items-center gap-1.5 px-3 py-2 cursor-pointer transition-all text-sm relative',
              'rounded-t-lg border border-b-0',
              isActive
                ? 'bg-background border-border text-foreground z-10 -mb-px'
                : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
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
      {/* Bottom border line */}
      <div className="flex-1 border-b border-border self-end h-0" />
    </div>
  )
}
