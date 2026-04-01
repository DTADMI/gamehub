export type SiteLocale = "en" | "fr";

export const siteCopy = {
  en: {
    home: {
      title: "Playful Engineering, Practical Results",
      subtitle:
        "Explore a portfolio of interactive games and full-stack projects. Each experience highlights product thinking, performance work, and polished UI craft.",
      exploreAll: "Explore All",
      viewResume: "View Resume",
      readBlog: "Read Blog",
      featuredGames: "Featured Games",
      featuredProjects: "Featured Projects",
    },
    projects: {
      title: "Projects",
      subtitle:
        "Product-focused builds with clear technical depth, shipping discipline, and modern UX. Every project links directly to its GitHub repository.",
      featured: "Featured",
      highlighted: "highlighted",
      allProjects: "All Projects",
      total: "total",
      viewOnGithub: "View on GitHub",
      viewRepository: "View repository",
    },
    blog: {
      title: "Blog",
      subtitle: "Product, engineering, and game development notes.",
      fallback: "No posts published yet. Check back soon.",
      readArticle: "Read article",
    },
    auth: {
      title: "Welcome back",
      subtitle: "Use your Supabase account to sign in or create one.",
      signIn: "Sign In",
      signUp: "Sign Up",
      email: "Email",
      username: "Username",
      password: "Password",
      signingIn: "Signing in...",
      creating: "Creating account...",
      needAccount: "Need an account?",
      haveAccount: "Already have an account?",
      accountCreated:
        "Account created. Check your email for confirmation if required, then sign in.",
    },
    games: {
      title: "Our Games Collection",
      subtitle: "Discover and play our selection of fun and engaging games",
      signInHint: "Sign in to track your progress and compete on the leaderboards!",
      featured: "Featured",
      upcoming: "Upcoming",
      comingSoon: "Coming Soon",
      playNow: "Play Now",
      devPlayable: "Dev-Playable",
    },
  },
  fr: {
    home: {
      title: "Ingénierie Ludique, Résultats Concrets",
      subtitle:
        "Explorez un portfolio de jeux interactifs et de projets full-stack. Chaque expérience met en valeur la réflexion produit, la performance et une UI soignée.",
      exploreAll: "Tout Explorer",
      viewResume: "Voir CV",
      readBlog: "Lire le Blog",
      featuredGames: "Jeux en Vedette",
      featuredProjects: "Projets en Vedette",
    },
    projects: {
      title: "Projets",
      subtitle:
        "Des réalisations orientées produit avec une vraie profondeur technique, une exécution solide et une UX moderne. Chaque projet renvoie vers son dépôt GitHub.",
      featured: "En Vedette",
      highlighted: "mis en avant",
      allProjects: "Tous les Projets",
      total: "au total",
      viewOnGithub: "Voir sur GitHub",
      viewRepository: "Voir le dépôt",
    },
    blog: {
      title: "Blog",
      subtitle: "Notes produit, ingénierie et développement de jeux.",
      fallback: "Aucun article publié pour le moment. Revenez bientôt.",
      readArticle: "Lire l'article",
    },
    auth: {
      title: "Bon retour",
      subtitle: "Utilisez votre compte Supabase pour vous connecter ou en créer un.",
      signIn: "Connexion",
      signUp: "Inscription",
      email: "E-mail",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      signingIn: "Connexion...",
      creating: "Création du compte...",
      needAccount: "Besoin d'un compte ?",
      haveAccount: "Déjà un compte ?",
      accountCreated:
        "Compte créé. Vérifiez votre e-mail pour la confirmation si nécessaire, puis connectez-vous.",
    },
    games: {
      title: "Notre Collection de Jeux",
      subtitle: "Découvrez et jouez à notre sélection de jeux fun et captivants",
      signInHint: "Connectez-vous pour suivre votre progression et monter au classement !",
      featured: "Vedette",
      upcoming: "À venir",
      comingSoon: "Bientôt Disponible",
      playNow: "Jouer",
      devPlayable: "Jouable en Dev",
    },
  },
} as const;
