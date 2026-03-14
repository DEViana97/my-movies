"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";

export function GlobalSearch() {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term, 300);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!debounced.trim()) return;
    router.push(`/search?q=${encodeURIComponent(debounced.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-2.5 text-white/60" size={18} />
      <Input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Buscar filmes e séries"
        className="pl-9"
      />
    </form>
  );
}
