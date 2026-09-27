export const LOCALES = ["en", "pt", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  fr: "Français",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
  fr: "FR",
};

/** UI strings that are fixed at build time rather than CMS content. */
export const UI = {
  en: {
    nav: { home: "Home", portfolio: "Portfolio", stories: "Stories", about: "About", contact: "Contact", shop: "Shop" },
    home: { featured: "Featured work", latestStories: "Latest stories", viewAll: "View all", more: "More" },
    portfolio: {
      artwork: "Artwork",
      commission: "Selected clients",
      empty: "Nothing published here yet.",
      commissioned: "Commissioned work",
    },
    stories: { empty: "No stories yet.", read: "Read", minRead: "min read" },
    contact: { title: "Inquiries", formName: "Name", formEmail: "Email", formMessage: "Message", submit: "Send inquiry", direct: "Prefer email?", success: "Thank you — your message has been sent.", error: "Something went wrong. Please try again or email directly." },
    shop: { comingSoon: "Coming soon", notify: "The shop is being prepared. Get in touch to be notified.", buy: "Buy", unlisted: "Details on request" },
    product: { details: "Details", inquire: "Enquire" },
    footer: { rights: "All rights reserved", builtWith: "Paris · São Paulo" },
    notFound: { title: "Page not found", body: "The page you were looking for has moved or never existed.", home: "Back to home" },
  },
  pt: {
    nav: { home: "Início", portfolio: "Portfólio", stories: "Histórias", about: "Sobre", contact: "Contato", shop: "Loja" },
    home: { featured: "Obras em destaque", latestStories: "Histórias recentes", viewAll: "Ver tudo", more: "Mais" },
    portfolio: {
      artwork: "Obras",
      commission: "Clientes selecionados",
      empty: "Nada publicado aqui ainda.",
      commissioned: "Trabalho freelancer",
    },
    stories: { empty: "Nenhuma história ainda.", read: "Ler", minRead: "min de leitura" },
    contact: { title: "Contato", formName: "Nome", formEmail: "E-mail", formMessage: "Mensagem", submit: "Enviar mensagem", direct: "Prefere e-mail?", success: "Obrigado — sua mensagem foi enviada.", error: "Algo deu errado. Tente novamente ou envie por e-mail." },
    shop: { comingSoon: "Em breve", notify: "A loja está sendo preparada. Entre em contato para ser avisado.", buy: "Comprar", unlisted: "Detalhes a combinar" },
    product: { details: "Detalhes", inquire: "Consultar" },
    footer: { rights: "Todos os direitos reservados", builtWith: "Paris · São Paulo" },
    notFound: { title: "Página não encontrada", body: "A página que você procura mudou de lugar ou nunca existiu.", home: "Voltar ao início" },
  },
  fr: {
    nav: { home: "Accueil", portfolio: "Portefeuille", stories: "Récits", about: "À propos", contact: "Contact", shop: "Boutique" },
    home: { featured: "Œuvres à la une", latestStories: "Derniers récits", viewAll: "Tout voir", more: "Plus" },
    portfolio: {
      artwork: "Œuvres",
      commission: "Clients sélectionnés",
      empty: "Rien de publié ici pour le moment.",
      commissioned: "Commande",
    },
    stories: { empty: "Aucun récit pour le moment.", read: "Lire", minRead: "min de lecture" },
    contact: { title: "Demandes", formName: "Nom", formEmail: "E-mail", formMessage: "Message", submit: "Envoyer", direct: "Préférez l'e-mail ?", success: "Merci — votre message a été envoyé.", error: "Une erreur est survenue. Réessayez ou écrivez directement." },
    shop: { comingSoon: "Bientôt disponible", notify: "La boutique est en préparation. Contactez-moi pour être informé.", buy: "Acheter", unlisted: "Détails sur demande" },
    product: { details: "Détails", inquire: "Demander" },
    footer: { rights: "Tous droits réservés", builtWith: "Paris · São Paulo" },
    notFound: { title: "Page introuvable", body: "La page recherchée a été déplacée ou n'a jamais existé.", home: "Retour à l'accueil" },
  },
} as const;

export type UIType = (typeof UI)[Locale];
