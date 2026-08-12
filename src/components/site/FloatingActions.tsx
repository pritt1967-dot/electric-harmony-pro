import { MessageCircle, Send } from "lucide-react";

import { CONTACTS } from "./contacts";

export function FloatingActions() {
  return (
    <div className="fixed bottom-20 right-3 z-40 flex flex-col gap-2.5 md:bottom-6 md:right-6">
      <a
        href={CONTACTS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в WhatsApp"
        className="grid size-12 place-items-center rounded-md bg-ink text-ink-foreground shadow-lg transition-transform hover:scale-110 md:size-13"
      >
        <MessageCircle className="size-5" />
      </a>
      <a
        href={CONTACTS.telegram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в Telegram"
        className="grid size-12 place-items-center rounded-md bg-ink text-ink-foreground shadow-lg transition-transform hover:scale-110 md:size-13"
      >
        <Send className="size-5" />
      </a>
    </div>
  );
}
