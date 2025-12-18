import { Check, CheckCheck, X, Clock } from 'lucide-react'
import type { Message } from '@/types'
import { cn, formatTime, getNodeName } from '@/lib/utils'
import { useMeshStore } from '@/store'

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const status = useMeshStore((s) => s.status)
  const nodes = useMeshStore((s) => s.nodes)

  const isOutgoing = message.is_outgoing || message.sender === status.my_node_id
  const senderNode = nodes.find((n) => n.id === message.sender)
  const senderName = isOutgoing ? 'You' : getNodeName(senderNode || { id: message.sender })

  const AckIcon = () => {
    switch (message.ack_status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-muted-foreground" />
      case 'ack':
        return <CheckCheck className="w-3 h-3 text-green-500" />
      case 'implicit_ack':
        return <Check className="w-3 h-3 text-green-500" />
      case 'nak':
      case 'failed':
        return <X className="w-3 h-3 text-red-500" />
      case 'received':
        return <Check className="w-3 h-3 text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col max-w-[70%] mb-2',
        isOutgoing ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      {!isOutgoing && (
        <span className="text-xs text-muted-foreground mb-1 px-1">
          {senderName}
        </span>
      )}

      <div className="relative group">
        <div
          className={cn(
            'rounded-2xl px-4 py-2 break-words',
            isOutgoing
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-secondary text-secondary-foreground rounded-bl-sm'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>

        {/* Reactions - attached to bottom right */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className={cn(
            "absolute -bottom-2 -right-3 flex flex-wrap gap-0.5 justify-end z-10",
            isOutgoing ? "translate-y-1/2" : "translate-y-1/2"
          )}>
            {Object.entries(message.reactions).map(([emoji, senders]) => (
              <div
                key={emoji}
                className="rounded-full px-1 py-0.5 text-lg flex items-center gap-0.5 cursor-default hover:scale-110 transition-transform"
                title={senders.join(', ')}
              >
                <span>{emoji}</span>
                {senders.length > 1 && (
                  <span className="text-muted-foreground font-medium text-[10px]">
                    {senders.length}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 px-1 mt-0.5">
        <span className="text-xs text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
        {isOutgoing && <AckIcon />}
      </div>
    </div>
  )
}
