"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles, Camera, TrendingUp, Loader2, PenLine, BookOpen } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { PageHeader, AiMarkdown } from "@/components/ui/primitives";
import type { ChatAction, ChatMessage } from "@/lib/types";

function MessageBody({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) return <>{content}</>;
  return <AiMarkdown content={content} />;
}

const STARTERS = [
  "She won't sit still for homework",
  "How do I explain “more than” simply?",
  "He shuts down when he's wrong",
  "What if she refuses tonight?",
];

const ACTION_META: Record<NonNullable<ChatAction>["type"], { href: string; icon: typeof Camera }> = {
  homework: { href: "/homework", icon: Camera },
  practice: { href: "/practice", icon: PenLine },
  library: { href: "/library", icon: BookOpen },
  progress: { href: "/progress", icon: TrendingUp },
};

function SparkleAvatar() {
  return (
    <div
      className="flex items-center justify-center rounded-full flex-shrink-0"
      style={{ width: 30, height: 30, background: PALETTE.brand }}
    >
      <Sparkles size={14} color="#fff" />
    </div>
  );
}

export function ChatScreen({
  childId,
  childName,
  initialMessages,
}: {
  childId: string;
  childName: string;
  initialMessages: ChatMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const localIdCounter = useRef(0);
  function nextLocalId(suffix: string) {
    localIdCounter.current += 1;
    return `local-${localIdCounter.current}-${suffix}`;
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);

    const optimisticUser: ChatMessage = {
      id: nextLocalId("u"),
      child_id: childId,
      role: "user",
      content,
      action: null,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimisticUser]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, message: content }),
      });
      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: nextLocalId("a"),
        child_id: childId,
        role: "assistant",
        content: data.reply || "Sorry, something went wrong — try again?",
        action: data.action ?? null,
        created_at: new Date().toISOString(),
        retryText: data.reply ? undefined : content,
      };
      setMessages((m) => [...m, assistantMessage]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: nextLocalId("e"),
          child_id: childId,
          role: "assistant",
          content: "Couldn't reach Easy just now — check your connection and try again.",
          action: null,
          created_at: new Date().toISOString(),
          retryText: content,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "70vh" }}>
      <PageHeader
        icon={<Sparkles size={20} color={PALETTE.brand} />}
        color={PALETTE.brand}
        soft={PALETTE.brandSoft}
        eyebrow="Ask Easy"
        title="Anything on your mind?"
      />

      {messages.length === 0 && (
        <div className="mb-5">
          <p className="text-sm mb-3" style={{ color: PALETTE.inkSoft }}>
            This never reaches {childName || "your kid"}
            {" "}&mdash; it&apos;s just for you. If it&apos;s worth acting on, Easy will point you to
            the right place.
          </p>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150"
                style={{ background: PALETTE.brandSoft, color: PALETTE.brand }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 mb-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 mb-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && <SparkleAvatar />}
            <div className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`} style={{ maxWidth: "80%" }}>
              <div
                className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  background: m.role === "user" ? PALETTE.brand : PALETTE.card,
                  color: m.role === "user" ? "#fff" : PALETTE.ink,
                  border: m.role === "assistant" ? `1px solid ${PALETTE.line}` : "none",
                  borderTopRightRadius: m.role === "user" ? 4 : undefined,
                  borderTopLeftRadius: m.role === "assistant" ? 4 : undefined,
                }}
              >
                <MessageBody content={m.content} isUser={m.role === "user"} />
              </div>
              {m.action && (
                <button
                  onClick={() => {
                    const meta = ACTION_META[m.action!.type];
                    const href = m.action!.subject ? `${meta.href}?subject=${m.action!.subject}` : meta.href;
                    router.push(href);
                  }}
                  className="mt-2 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-transform duration-150 active:scale-95"
                  style={{ background: PALETTE.accent, color: "#fff", borderRadius: RADIUS.sm }}
                >
                  {(() => {
                    const Icon = ACTION_META[m.action.type].icon;
                    return <Icon size={13} />;
                  })()}
                  {m.action.label}
                </button>
              )}
              {m.retryText && (
                <button
                  onClick={() => send(m.retryText)}
                  disabled={sending}
                  className="mt-1.5 text-xs font-bold underline"
                  style={{ color: PALETTE.brand }}
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-2.5 mb-4 justify-start">
            <SparkleAvatar />
            <div
              className="rounded-2xl px-4 py-3 flex items-center"
              style={{ background: PALETTE.card, border: `1px solid ${PALETTE.line}`, borderTopLeftRadius: 4 }}
            >
              <Loader2 size={15} className="animate-spin" color={PALETTE.inkFaint} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 pt-2 flex gap-2" style={{ background: PALETTE.bg }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a question..."
          aria-label="Message Easy"
          className="flex-1 px-4 py-3 text-sm outline-none"
          style={{ borderRadius: RADIUS.sm, border: `1px solid ${PALETTE.line}`, background: PALETTE.card }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || sending}
          aria-label="Send message"
          className="btn-press flex items-center justify-center px-4 transition-colors duration-150"
          style={{ borderRadius: RADIUS.sm, background: input.trim() ? PALETTE.brand : PALETTE.line }}
        >
          <Send size={17} color="#fff" />
        </button>
      </div>
    </div>
  );
}
