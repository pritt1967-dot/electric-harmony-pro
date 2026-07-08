import { Phone, MessageCircle, Send } from "lucide-react";

import { CONTACTS } from "./contacts";

export function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-3 sm:right-6">
      <a
        href={CONTACTS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в WhatsApp"
        className="grid size-13 place-items-center rounded-full bg-[oklch(0.72_0.18_150)] text-white shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircle className="size-6" />
      </a>
      <a
        href={CONTACTS.telegram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в Telegram"
        className="grid size-13 place-items-center rounded-full bg-[oklch(0.62_0.16_240)] text-white shadow-lg transition-transform hover:scale-110"
      >
        <Send className="size-6" />
      </a>
      <a
        href={CONTACTS.phoneHref}
        aria-label="Позвонить"
        className="grid size-13 place-items-center rounded-full gradient-brand text-brand-foreground shadow-lg transition-transform hover:scale-110"
      >
        <Phone className="size-6" />
      </a>
    </div>
  );
}
