import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type WhatsappOrderButtonProps = {
  message: string;
};

export function WhatsappOrderButton({ message }: WhatsappOrderButtonProps) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const encodedMessage = encodeURIComponent(message);
  const href = phone ? `https://wa.me/${phone}?text=${encodedMessage}` : `https://wa.me/?text=${encodedMessage}`;

  return (
    <Button asChild className="h-11 w-full text-[13px] lg:h-10 lg:text-sm">
      <a href={href} target="_blank" rel="noreferrer">
        <MessageCircle aria-hidden className="h-5 w-5" strokeWidth={2.4} />
        Order Through Whatsapp
      </a>
    </Button>
  );
}
