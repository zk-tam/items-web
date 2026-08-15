import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsappOrderButton() {
  return (
    <Button asChild className="h-11 w-full text-[13px] lg:h-10 lg:text-[13px]">
      <a href="http://wa.me/60176226280" target="_blank" rel="noreferrer">
        <MessageCircle aria-hidden className="h-5 w-5" strokeWidth={2.4} />
        Order Through Whatsapp
      </a>
    </Button>
  );
}
