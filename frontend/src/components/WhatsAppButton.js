import { useState } from "react";

const PHONE = "919046037840"; // country code + number, no + or spaces
const DEFAULT_MSG = "Hi Arya Travels! I'd like to enquire about a car rental.";

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(DEFAULT_MSG)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      data-testid="whatsapp-fab"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 group"
      style={{ transition: "transform 0.2s ease" }}
    >
      {/* Pulse ring */}
      <span className="absolute right-0 bottom-0 w-14 h-14 rounded-full bg-[#25D366] opacity-60 animate-ping pointer-events-none" />

      {/* Tooltip label — slides in on hover */}
      <span
        className={`hidden md:inline-flex items-center px-4 py-2 rounded-full bg-black/90 border border-white/10 text-sm font-medium text-white whitespace-nowrap shadow-xl ${
          hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3 pointer-events-none"
        }`}
        style={{ transition: "opacity 0.25s ease, transform 0.25s ease" }}
      >
        Chat on WhatsApp
      </span>

      {/* Button */}
      <span className="relative w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl group-hover:scale-105"
        style={{ transition: "transform 0.2s ease, background-color 0.2s ease" }}
      >
        {/* Official WhatsApp glyph */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="white"
          className="w-7 h-7"
          aria-hidden="true"
        >
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39-.152 0-.317-.09-.634-.229-1.406-.615-3.061-1.879-4.13-3.234-.415-.53-.83-1.045-.83-1.407 0-.229.11-.35.209-.484.208-.279.462-.586.681-.807.208-.203.31-.315.44-.585.128-.242.06-.44-.008-.612-.06-.157-.593-1.435-.815-1.958-.204-.464-.386-.407-.494-.407-.128 0-.288-.019-.442-.019-.153 0-.416.056-.646.315-.204.219-.826.803-.826 1.966s.85 2.286.972 2.44c.106.156 1.634 2.634 4.058 3.678 1.732.72 2.404.782 3.19.664 1.077-.166 2.202-.902 2.518-1.812.315-.911.315-1.691.221-1.858-.09-.157-.336-.246-.708-.407zM16.01 4.5c-6.35 0-11.5 5.15-11.5 11.5 0 2.34.7 4.51 1.9 6.32L4.5 27.5l5.4-1.87c1.72 1.05 3.75 1.66 5.93 1.66h.02c6.35 0 11.5-5.15 11.5-11.5s-5.14-11.29-11.34-11.29zm.02 20.75c-1.98 0-3.87-.55-5.52-1.55l-.4-.24-3.2 1.11 1.13-3.14-.27-.42c-1.09-1.72-1.66-3.72-1.66-5.77 0-5.55 4.51-10.06 10.06-10.06 2.66 0 5.16 1.04 7.04 2.92 1.88 1.88 2.92 4.38 2.92 7.04-.01 5.55-4.52 10.06-10.06 10.06z" />
        </svg>
      </span>
    </a>
  );
}
