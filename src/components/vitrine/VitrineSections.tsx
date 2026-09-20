"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AtSign, Briefcase, Mail, MapPin, PartyPopper, Utensils } from "lucide-react";

// Redesign do Módulo Vitrine (20/09/2026) — seções editoriais que hoje não
// existem na Vitrine (Hero, Como Funciona, Quem Somos, Como Atendemos, Fale
// Conosco, Rodapé), a partir do preview aprovado pelo Product Owner. Copy
// institucional (Quem Somos/Como Atendemos) é conteúdo de marca já aprovado,
// fixo neste arquivo — não vem do banco. Dados de contato vêm de /api/config.

interface StoreContact {
  name: string;
  email: string;
  instagram: string | null;
  phone: string | null;
  addressCity: string | null;
  addressState: string | null;
}

function useStoreContact(): StoreContact {
  const [contact, setContact] = useState<StoreContact>({
    name: "Doce Menina",
    email: "",
    instagram: null,
    phone: null,
    addressCity: null,
    addressState: null,
  });

  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.name) return;
        setContact({
          name: data.name,
          email: data.email,
          instagram: data.instagram,
          phone: data.phone,
          addressCity: data.addressCity,
          addressState: data.addressState,
        });
      })
      .catch(() => {});
  }, []);

  return contact;
}

/** `phone` vem livre de formatação do StoreConfig — normaliza para dígitos e
 * garante DDI 55 (Brasil) antes de montar o link wa.me. */
function buildWhatsAppLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountryCode}${text}`;
}

export function VitrineHero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-cream px-5 py-16 md:px-6 md:py-20"
    >
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[0.25em] text-gold">
          <span className="font-serif text-base italic text-wine">I.</span>
          Início
          <span className="h-px w-6 bg-gold" />
        </div>
        <h1 className="font-serif mt-4 text-[32px] italic leading-[1.15] text-wine-deep md:text-[44px]">
          Transformamos momentos
          <br />
          em <em className="text-wine">memórias especiais</em>.
        </h1>
        <p className="font-serif mt-4 text-lg italic font-semibold text-wine">
          Sabor, cuidado e personalidade em cada detalhe
        </p>
        <p className="text-muted mt-3 text-sm leading-relaxed md:max-w-md">
          Criamos doces, salgados e cardápios personalizados para celebrações de diferentes
          estilos e ocasiões — da escolha do menu à apresentação, cuidamos de cada detalhe
          para que sua experiência seja especial.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href="#cardapio"
            className="rounded-full bg-wine px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-wine-deep"
          >
            Ver cardápio
          </a>
          <a
            href="#contato"
            className="rounded-full border border-sand px-6 py-3 text-xs font-bold uppercase tracking-wide text-wine-deep transition-colors hover:bg-surface-2"
          >
            Pedir orçamento
          </a>
        </div>
        <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-sand bg-card px-5 py-3.5 shadow-card">
          <span className="font-serif text-2xl italic font-semibold text-wine">40</span>
          <span className="text-muted max-w-[200px] text-[11px] leading-tight">
            anos de história por trás de cada receita
          </span>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "1", title: "Escolha os itens", text: "Navegue pelo cardápio e monte sua sacola pelas ocasiões ou categorias." },
    { n: "2", title: "Fale com a gente", text: "Confirme data, entrega e detalhes com a equipe pelo WhatsApp." },
    { n: "3", title: "Receba no dia certo", text: "Prazo de produção combinado, entrega ou retirada como preferir." },
  ];

  return (
    <div className="bg-cream px-5 pb-4 md:px-6">
      <div className="mx-auto grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-sand bg-sand md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.n} className="flex gap-4 bg-card p-6">
            <span className="font-serif shrink-0 text-2xl italic font-semibold leading-none text-wine">
              {step.n}
            </span>
            <div>
              <h4 className="text-sm font-bold text-wine-deep">{step.title}</h4>
              <p className="text-muted mt-1 text-xs leading-relaxed">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AboutSection() {
  const stats = [
    { num: "40", label: "Anos de experiência e inspiração" },
    { num: "2", label: "Anos da Doce Menina" },
    { num: "100%", label: "Cardápios personalizados e preparados sob medida" },
    { num: "3", label: "Frentes de atuação: celebrações, coquetéis e corporativo" },
  ];

  return (
    <section id="quem-somos" className="bg-surface-2 px-5 py-16 md:px-6 md:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <div className="flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[0.25em] text-gold">
            <span className="font-serif text-base italic text-wine">II.</span>
            Quem Somos
            <span className="h-px w-6 bg-gold" />
          </div>
          <h2 className="font-serif mt-4 text-2xl italic text-wine-deep md:text-[28px]">
            Uma história que começou muito antes da Doce Menina
          </h2>
          <p className="font-serif mt-5 text-base italic leading-relaxed text-chocolate">
            A Doce Menina nasceu de uma história de mais de <strong className="text-wine not-italic">40 anos</strong>{" "}
            de experiência e paixão pela confeitaria. Há <strong className="text-wine not-italic">2 anos</strong>,
            essa trajetória ganhou uma marca, uma identidade e um espaço para criar novas histórias.
          </p>
          <p className="font-serif mt-3 text-base italic leading-relaxed text-chocolate">
            Hoje, desenvolvemos cardápios personalizados para celebrações, coquetéis e eventos
            corporativos, unindo sabor, apresentação e cuidado em cada entrega.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 rounded-lg border border-sand bg-card p-8">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-3xl italic font-semibold text-wine">{s.num}</div>
              <div className="text-muted mt-2 text-[11px] leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceLines() {
  const lines = [
    {
      icon: PartyPopper,
      title: "Datas Comemorativas",
      text: "Aniversários, mesversários, Dia das Mães, Páscoa e outras celebrações — cardápio personalizado de acordo com a ocasião, o estilo e as preferências de cada cliente.",
      tag: "Personalização sob medida",
    },
    {
      icon: Utensils,
      title: "Coquetéis",
      text: "Doces e salgados para compor celebrações de diferentes estilos e tamanhos, desenvolvidos junto com você de acordo com a proposta do evento.",
      tag: "Cardápio exclusivo por evento",
    },
    {
      icon: Briefcase,
      title: "Corporativo",
      text: "Confraternizações, aniversariantes do mês, ações internas e outros momentos corporativos — opções práticas, bem apresentadas e prontas para receber convidados.",
      tag: "Eventos internos e institucionais",
    },
  ];

  return (
    <section className="bg-cream px-5 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-lg text-center">
          <div className="flex items-center justify-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[0.25em] text-gold">
            <span className="font-serif text-base italic text-wine">III.</span>
            Como atendemos
            <span className="h-px w-6 bg-gold" />
          </div>
          <h2 className="font-serif mt-4 text-2xl italic text-wine-deep md:text-[28px]">
            Três formas de celebrar com a gente
          </h2>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-sand bg-sand md:grid-cols-3">
          {lines.map((line) => (
            <div key={line.title} className="bg-card p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold text-wine">
                <line.icon size={19} strokeWidth={1.6} />
              </div>
              <h3 className="font-serif mt-5 text-xl font-semibold text-wine-deep">{line.title}</h3>
              <p className="text-muted mt-3 text-[13px] leading-relaxed">{line.text}</p>
              <span className="mt-4 block border-t border-sand pt-3 text-[10px] font-bold uppercase tracking-widest text-gold">
                {line.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  const contact = useStoreContact();

  return (
    <section id="contato" className="relative overflow-hidden bg-wine-deep px-5 py-16 text-center md:px-6 md:py-20">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[0.25em] text-gold">
          <span className="font-serif text-base italic text-[#F3E7E3]">IV.</span>
          Fale Conosco
          <span className="h-px w-6 bg-gold" />
        </div>
        <h2 className="font-serif mt-4 text-2xl italic text-[#FBF3EE] md:text-[30px]">
          Vamos planejar o seu próximo momento especial?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#D9BFBB]">
          Conte pra gente a data, a ocasião e o número de convidados — respondemos rapidinho.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {contact.phone && (
            <a
              href={buildWhatsAppLink(
                contact.phone,
                `Olá, gostaria de saber mais sobre os serviços da ${contact.name}!`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#F3E7E3] px-6 py-3 text-xs font-bold uppercase tracking-wide text-wine-deep transition-colors hover:bg-white"
            >
              Chamar no WhatsApp
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="rounded-full border border-[#F3E7E3]/35 px-6 py-3 text-xs font-bold uppercase tracking-wide text-[#F3E7E3] transition-colors hover:bg-white/10"
            >
              Enviar e-mail
            </a>
          )}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 border-t border-white/15 pt-6 text-xs text-[#D9BFBB]">
          {contact.instagram && (
            <span className="flex items-center gap-1.5">
              <AtSign size={14} className="text-gold" /> {contact.instagram}
            </span>
          )}
          {contact.email && (
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-gold" /> {contact.email}
            </span>
          )}
          {contact.addressCity && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gold" /> {contact.addressCity}
              {contact.addressState ? `/${contact.addressState}` : ""}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const contact = useStoreContact();

  return (
    <footer className="bg-cream px-5 py-8 text-center">
      <p className="font-serif text-sm italic text-wine">Obrigada pela preferência</p>
      <p className="text-muted mt-1 text-[11px]">© {contact.name} — Ateliê de Confeitaria Artesanal</p>
    </footer>
  );
}

/** Só renderiza quando há telefone real cadastrado em /admin/config — sem
 * fallback fixo para não expor um número que a loja não confirmou. */
export function FloatingWhatsApp() {
  const contact = useStoreContact();
  if (!contact.phone) return null;

  return (
    <Link
      href={buildWhatsAppLink(contact.phone)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.77.46 3.45 1.34 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.92 0-5.46-4.44-9.9-9.9-9.9zm5.8 14.19c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.77-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.18 1.53 1.91 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.61-.07.16-.19.7-.81.89-1.09.19-.28.37-.23.63-.14.25.09 1.62.77 1.9.91.28.14.46.21.53.33.07.12.07.68-.17 1.36z" />
      </svg>
    </Link>
  );
}
