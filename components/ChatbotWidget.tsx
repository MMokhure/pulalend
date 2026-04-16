"use client";

import { useMemo, useState } from "react";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
};

const quickPrompts = [
  "How long do approvals take?",
  "What documents do I need for KYC?",
  "How do repayments work?",
  "How do I choose a lender?",
];

const faqRules = [
  {
    keywords: ["approval", "approved", "review", "reviewed", "approval time", "how long"],
    answer:
      "Most loan requests are reviewed within 48 hours. You will see status updates in your borrower dashboard once a decision is made.",
  },
  {
    keywords: ["kyc", "verify", "verification", "documents", "id", "selfie"],
    answer:
      "KYC requires a valid government ID (front, and back if available) and a clear selfie. Keep details consistent with your profile.",
  },
  {
    keywords: ["repay", "repayment", "schedule", "due", "pay"],
    answer:
      "Repayments are shown on your borrower dashboard with due dates and statuses. Paying on time strengthens your profile and unlocks better terms.",
  },
  {
    keywords: ["lender", "choose", "selection", "pick", "investor"],
    answer:
      "Borrowers can select verified lenders with available balance during the loan application. You can choose multiple lenders to increase your chances.",
  },
  {
    keywords: ["interest", "rate", "returns"],
    answer:
      "Interest rates are set per loan request and shown before you submit. Estimated returns are displayed when you choose lenders.",
  },
  {
    keywords: ["cancel", "cancelled", "withdraw"],
    answer:
      "You can cancel a loan request while it is still pending. Once approved, cancellation is no longer available.",
  },
  {
    keywords: ["pula", "currency", "p"],
    answer:
      "All amounts are shown in Botswana Pula (P) across the borrower experience.",
  },
];

const defaultReplies = [
  "I can help with KYC, approvals, repayments, and lender matching. Try a quick question below.",
  "Ask me about loan approvals, KYC, repayments, or choosing a lender.",
  "Not sure yet? Try one of the suggested questions.",
];

const getBotReply = (message: string) => {
  const normalized = message.toLowerCase();
  for (const rule of faqRules) {
    if (rule.keywords.some((word) => normalized.includes(word))) {
      return rule.answer;
    }
  }
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "bot",
    text: "Hi! I am the Pulalend assistant. Ask me about approvals, KYC, repayments, or choosing lenders.",
  }]);

  const conversation = useMemo(() => messages, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const botMessage: Message = {
      id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: "bot",
      text: getBotReply(trimmed),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  };

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] rounded-3xl chatbot-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-deep/10 flex items-center justify-between bg-white/80">
            <div>
              <div className="font-display text-lg text-navy-deep">Pulalend Chat</div>
              <div className="text-xs text-navy-deep/60">Structured answers, fast</div>
            </div>
            <button
              className="text-xs text-white bg-navy-deep px-2 py-1 rounded-full"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto px-5 py-4 space-y-4 bg-white">
            {conversation.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "items-start"}`}
              >
                {message.role === "bot" && (
                  <div className="w-9 h-9 rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center font-bold">
                    P
                  </div>
                )}
                <div
                  className={`max-w-[220px] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                    message.role === "user"
                      ? "bg-primary-blue text-white"
                      : "bg-slate-50 border border-slate-100 text-navy-deep"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 pb-4 pt-1 bg-white">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="text-xs px-3 py-1 rounded-full border border-navy-deep/10 text-navy-deep/70 hover:bg-navy-deep/5"
                  type="button"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
            >
              <input
                className="flex-1 px-4 py-2 rounded-full border border-navy-deep/10 focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-primary-blue text-white rounded-full hover:bg-navy-deep transition"
                type="submit"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          className="rounded-full bg-navy-deep text-white px-4 py-3 shadow-lg hover:bg-primary-blue transition"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          Chat with Pulalend
        </button>
      )}
    </div>
  );
}
