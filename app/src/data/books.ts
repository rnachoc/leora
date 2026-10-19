import type { GenreId, Localized, MoodId } from './taxonomy';

export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  pages: number;
  genres: GenreId[];
  moods: MoodId[];
  /** Base colour used for the generated cover and spine. */
  color: string;
  synopsis: Localized;
  /** Real cover image (catalog). When missing or broken, a cover is generated from `color`. */
  coverUrl?: string;
  /** Where the record comes from: the bundled sample catalog or a live catalog API. */
  source?: 'sample' | 'openlibrary' | 'googlebooks';
};

/**
 * Sample catalog for the prototype. In production this comes from
 * Google Books / Open Library and is cached in Supabase.
 */
export const CATALOG: Book[] = [
  // ——— Books in the demo user's library ———
  {
    id: 'sombra-viento',
    title: 'La sombra del viento',
    author: 'Carlos Ruiz Zafón',
    year: 2001,
    pages: 576,
    genres: ['literary', 'mystery', 'historical'],
    moods: ['dark', 'unputdownable'],
    color: '#5B2A2A',
    synopsis: {
      es: 'Un niño rescata un libro olvidado en la Barcelona de posguerra y alguien empieza a quemar cada ejemplar de su autor.',
      en: 'In post-war Barcelona a boy rescues a forgotten novel, while someone is burning every copy its author ever wrote.',
    },
  },
  {
    id: 'reina-roja',
    title: 'Reina roja',
    author: 'Juan Gómez-Jurado',
    year: 2018,
    pages: 568,
    genres: ['thriller'],
    moods: ['unputdownable'],
    color: '#8E1F1F',
    synopsis: {
      es: 'Antonia Scott, la mente más brillante del país, vuelve a la acción junto a un inspector que no encaja en ninguna parte.',
      en: "Antonia Scott, the sharpest mind in Spain, is pulled back into action alongside a cop who doesn't fit anywhere.",
    },
  },
  {
    id: 'habitos-atomicos',
    title: 'Hábitos atómicos',
    author: 'James Clear',
    year: 2018,
    pages: 320,
    genres: ['selfhelp'],
    moods: ['learn', 'light'],
    color: '#E4D8BE',
    synopsis: {
      es: 'Un método práctico para construir buenos hábitos con cambios diminutos que se acumulan.',
      en: 'A practical system for building good habits through tiny changes that compound.',
    },
  },
  {
    id: 'paciente-silenciosa',
    title: 'La paciente silenciosa',
    author: 'Alex Michaelides',
    year: 2019,
    pages: 352,
    genres: ['thriller', 'mystery'],
    moods: ['unputdownable', 'dark'],
    color: '#3E4A57',
    synopsis: {
      es: 'Una pintora dispara a su marido y no vuelve a decir una palabra. Un psicoterapeuta se obsesiona con hacerla hablar.',
      en: 'A painter shoots her husband and never speaks again. A psychotherapist becomes obsessed with making her talk.',
    },
  },
  {
    id: 'hail-mary',
    title: 'Proyecto Hail Mary',
    author: 'Andy Weir',
    year: 2021,
    pages: 496,
    genres: ['scifi'],
    moods: ['unputdownable', 'escape', 'light'],
    color: '#C76B2C',
    synopsis: {
      es: 'Un profesor despierta solo en una nave sin recordar cómo llegó, con la supervivencia de la Tierra en sus manos.',
      en: "A teacher wakes up alone on a spaceship with no memory, and Earth's survival in his hands.",
    },
  },
  {
    id: 'evelyn-hugo',
    title: 'Los siete maridos de Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    year: 2017,
    pages: 400,
    genres: ['drama', 'romance', 'historical'],
    moods: ['heartbreak'],
    color: '#1F5C4F',
    synopsis: {
      es: 'Una leyenda de Hollywood elige a una periodista desconocida para contar por fin toda la verdad sobre su vida.',
      en: 'A Hollywood legend picks an unknown journalist to finally tell the whole truth about her life.',
    },
  },
  {
    id: 'tres-cuerpos',
    title: 'El problema de los tres cuerpos',
    author: 'Liu Cixin',
    year: 2008,
    pages: 408,
    genres: ['scifi'],
    moods: ['learn', 'escape'],
    color: '#26323F',
    synopsis: {
      es: 'Un experimento secreto de la China de los sesenta tiene consecuencias que alcanzan las estrellas.',
      en: "A secret experiment in 1960s China has consequences that reach the stars.",
    },
  },
  {
    id: 'cien-anos',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    year: 1967,
    pages: 471,
    genres: ['literary'],
    moods: ['escape'],
    color: '#B9873A',
    synopsis: {
      es: 'Siete generaciones de los Buendía en Macondo, donde lo extraordinario es parte de la vida diaria.',
      en: 'Seven generations of the Buendía family in Macondo, where the extraordinary is everyday life.',
    },
  },
  {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    year: 2011,
    pages: 496,
    genres: ['nonfiction'],
    moods: ['learn'],
    color: '#A33A2B',
    synopsis: {
      es: 'Cómo una especie de simio insignificante acabó dominando el planeta.',
      en: 'How an insignificant ape species came to rule the planet.',
    },
  },
  {
    id: 'busca-sentido',
    title: 'El hombre en busca de sentido',
    author: 'Viktor Frankl',
    year: 1946,
    pages: 168,
    genres: ['nonfiction', 'selfhelp'],
    moods: ['learn', 'heartbreak'],
    color: '#4A4038',
    synopsis: {
      es: 'Un psiquiatra superviviente de los campos de concentración reflexiona sobre lo que nos mantiene vivos.',
      en: 'A psychiatrist who survived the camps reflects on what keeps us alive.',
    },
  },
  {
    id: 'circe',
    title: 'Circe',
    author: 'Madeline Miller',
    year: 2018,
    pages: 400,
    genres: ['fantasy', 'literary'],
    moods: ['escape', 'heartbreak'],
    color: '#6E5420',
    synopsis: {
      es: 'La hechicera de la Odisea cuenta su propia historia, desterrada en una isla y enfrentada a los dioses.',
      en: 'The witch of the Odyssey tells her own story, exiled to an island and defying the gods.',
    },
  },
  {
    id: 'nombre-viento',
    title: 'El nombre del viento',
    author: 'Patrick Rothfuss',
    year: 2007,
    pages: 880,
    genres: ['fantasy'],
    moods: ['escape'],
    color: '#2D3B2C',
    synopsis: {
      es: 'Kvothe, ahora posadero, relata cómo se convirtió en la leyenda más temida y admirada de su mundo.',
      en: 'Kvothe, now an innkeeper, recounts how he became the most notorious legend of his world.',
    },
  },
  {
    id: 'tokio-blues',
    title: 'Tokio blues',
    author: 'Haruki Murakami',
    year: 1987,
    pages: 384,
    genres: ['literary', 'drama', 'romance'],
    moods: ['heartbreak'],
    color: '#7A2E35',
    synopsis: {
      es: 'Una canción devuelve a Toru a sus años de estudiante en Tokio y a un amor marcado por la pérdida.',
      en: 'A song takes Toru back to his student years in Tokyo and a love shaped by loss.',
    },
  },
  {
    id: 'infinito-junco',
    title: 'El infinito en un junco',
    author: 'Irene Vallejo',
    year: 2019,
    pages: 452,
    genres: ['nonfiction', 'historical'],
    moods: ['learn'],
    color: '#C2A577',
    synopsis: {
      es: 'Un viaje por la invención de los libros en el mundo antiguo, contado como una aventura.',
      en: 'A journey through the invention of books in the ancient world, told like an adventure.',
    },
  },
  {
    id: 'rebeca',
    title: 'Rebeca',
    author: 'Daphne du Maurier',
    year: 1938,
    pages: 448,
    genres: ['mystery', 'literary'],
    moods: ['dark'],
    color: '#3B2B3F',
    synopsis: {
      es: 'Una joven recién casada llega a Manderley, donde todo sigue perteneciendo a la primera esposa.',
      en: 'A young bride arrives at Manderley, where everything still belongs to the first wife.',
    },
  },
  {
    id: 'alas-sangre',
    title: 'Alas de sangre',
    author: 'Rebecca Yarros',
    year: 2023,
    pages: 736,
    genres: ['fantasy', 'romance'],
    moods: ['unputdownable', 'escape'],
    color: '#8B1D2C',
    synopsis: {
      es: 'Violet entra a la fuerza en una academia de jinetes de dragones donde sobrevivir ya es un logro.',
      en: 'Violet is forced into a dragon-rider academy where simply surviving is an achievement.',
    },
  },
  {
    id: 'patria',
    title: 'Patria',
    author: 'Fernando Aramburu',
    year: 2016,
    pages: 648,
    genres: ['drama', 'literary', 'historical'],
    moods: ['heartbreak', 'dark'],
    color: '#2F4858',
    synopsis: {
      es: 'Dos familias amigas de un pueblo vasco quedan separadas por décadas de violencia.',
      en: 'Two close families in a Basque village are torn apart by decades of violence.',
    },
  },
  {
    id: 'dune',
    title: 'Dune',
    author: 'Frank Herbert',
    year: 1965,
    pages: 704,
    genres: ['scifi'],
    moods: ['escape'],
    color: '#B5652B',
    synopsis: {
      es: 'En el planeta desierto Arrakis, un joven heredero se ve en el centro de una guerra por la especia.',
      en: 'On the desert planet Arrakis, a young heir lands at the centre of a war over the spice.',
    },
  },
  {
    id: 'poder-ahora',
    title: 'El poder del ahora',
    author: 'Eckhart Tolle',
    year: 1997,
    pages: 240,
    genres: ['selfhelp'],
    moods: ['learn'],
    color: '#5D7A8C',
    synopsis: {
      es: 'Una guía espiritual para vivir el presente y salir del ruido mental.',
      en: 'A spiritual guide to living in the present and stepping out of mental noise.',
    },
  },
  {
    id: 'chica-tren',
    title: 'La chica del tren',
    author: 'Paula Hawkins',
    year: 2015,
    pages: 496,
    genres: ['thriller'],
    moods: ['unputdownable', 'dark'],
    color: '#44505A',
    synopsis: {
      es: 'Desde el tren, Rachel observa cada día a una pareja perfecta, hasta que ve algo que no debería.',
      en: 'From the train, Rachel watches a perfect couple every day, until she sees something she shouldn’t.',
    },
  },
  {
    id: 'loba-negra',
    title: 'Loba negra',
    author: 'Juan Gómez-Jurado',
    year: 2019,
    pages: 528,
    genres: ['thriller'],
    moods: ['unputdownable'],
    color: '#1E1E24',
    synopsis: {
      es: 'Antonia Scott y Jon Gutiérrez viajan a Málaga tras la pista de una mujer que huye de la mafia rusa.',
      en: 'Antonia Scott and Jon Gutiérrez head to Málaga to find a woman running from the Russian mob.',
    },
  },
  {
    id: 'romper-circulo',
    title: 'Romper el círculo',
    author: 'Colleen Hoover',
    year: 2016,
    pages: 384,
    genres: ['romance', 'drama'],
    moods: ['heartbreak'],
    color: '#C98A8E',
    synopsis: {
      es: 'Lily empieza de cero en Boston y se enamora, pero aprende que el amor no siempre basta.',
      en: 'Lily starts over in Boston and falls in love, but learns that love is not always enough.',
    },
  },

  // ——— Wider catalog used by the recommender ———
  {
    id: 'juego-angel',
    title: 'El juego del ángel',
    author: 'Carlos Ruiz Zafón',
    year: 2008,
    pages: 672,
    genres: ['literary', 'mystery', 'historical'],
    moods: ['dark'],
    color: '#3F2A3A',
    synopsis: {
      es: 'Un escritor maldito acepta un encargo misterioso que lo arrastra a la cara más sombría de Barcelona.',
      en: 'A struggling writer accepts a mysterious commission that drags him into Barcelona’s darkest side.',
    },
  },
  {
    id: 'rey-blanco',
    title: 'Rey blanco',
    author: 'Juan Gómez-Jurado',
    year: 2020,
    pages: 576,
    genres: ['thriller'],
    moods: ['unputdownable'],
    color: '#D8D2C6',
    synopsis: {
      es: 'El cierre de la trilogía: Antonia Scott se enfrenta por fin al enemigo que la ha manejado desde el principio.',
      en: 'The trilogy finale: Antonia Scott finally faces the enemy who has been pulling the strings.',
    },
  },
  {
    id: 'ciudad-blanca',
    title: 'El silencio de la ciudad blanca',
    author: 'Eva García Sáenz de Urturi',
    year: 2016,
    pages: 480,
    genres: ['thriller', 'mystery'],
    moods: ['unputdownable', 'dark'],
    color: '#6F7F86',
    synopsis: {
      es: 'Unos crímenes rituales sacuden Vitoria veinte años después de que el supuesto culpable entrara en prisión.',
      en: 'Ritual murders shake Vitoria twenty years after the supposed killer went to prison.',
    },
  },
  {
    id: 'perdida',
    title: 'Perdida',
    author: 'Gillian Flynn',
    year: 2012,
    pages: 560,
    genres: ['thriller', 'mystery'],
    moods: ['unputdownable', 'dark'],
    color: '#2B2B2B',
    synopsis: {
      es: 'El día de su aniversario, Amy desaparece y todas las miradas apuntan a su marido.',
      en: 'On their anniversary Amy vanishes, and every eye turns to her husband.',
    },
  },
  {
    id: 'harry-quebert',
    title: 'La verdad sobre el caso Harry Quebert',
    author: 'Joël Dicker',
    year: 2012,
    pages: 672,
    genres: ['mystery', 'thriller'],
    moods: ['unputdownable'],
    color: '#2E4E6E',
    synopsis: {
      es: 'Un joven escritor investiga el crimen del que acusan a su mentor, treinta años después.',
      en: 'A young writer investigates the crime his mentor is accused of, thirty years on.',
    },
  },
  {
    id: 'dia-cordura',
    title: 'El día que se perdió la cordura',
    author: 'Javier Castillo',
    year: 2017,
    pages: 456,
    genres: ['thriller'],
    moods: ['unputdownable', 'dark'],
    color: '#4B1F1F',
    synopsis: {
      es: 'Un hombre camina desnudo por Salem con una cabeza en las manos, y el caso no ha hecho más que empezar.',
      en: 'A naked man walks through Salem carrying a head, and the case has only just begun.',
    },
  },
  {
    id: 'materia-oscura',
    title: 'Materia oscura',
    author: 'Blake Crouch',
    year: 2016,
    pages: 400,
    genres: ['scifi', 'thriller'],
    moods: ['unputdownable'],
    color: '#1C2B3A',
    synopsis: {
      es: 'Un físico es secuestrado y despierta en una vida que no es la suya.',
      en: 'A physicist is abducted and wakes up in a life that is not his own.',
    },
  },
  {
    id: 'recursion',
    title: 'Recursión',
    author: 'Blake Crouch',
    year: 2019,
    pages: 384,
    genres: ['scifi', 'thriller'],
    moods: ['unputdownable', 'learn'],
    color: '#3D5A6C',
    synopsis: {
      es: 'Una epidemia de recuerdos falsos lleva a un policía y a una neurocientífica a una tecnología que cambia el tiempo.',
      en: 'An epidemic of false memories leads a cop and a neuroscientist to a technology that rewrites time.',
    },
  },
  {
    id: 'klara-sol',
    title: 'Klara y el Sol',
    author: 'Kazuo Ishiguro',
    year: 2021,
    pages: 320,
    genres: ['scifi', 'literary'],
    moods: ['heartbreak'],
    color: '#D9A441',
    synopsis: {
      es: 'Una amiga artificial observa el mundo humano mientras cuida de una niña enferma.',
      en: 'An artificial friend observes the human world while caring for a sick girl.',
    },
  },
  {
    id: 'cancion-aquiles',
    title: 'La canción de Aquiles',
    author: 'Madeline Miller',
    year: 2011,
    pages: 384,
    genres: ['fantasy', 'romance', 'historical'],
    moods: ['heartbreak', 'escape'],
    color: '#3A5F7A',
    synopsis: {
      es: 'La guerra de Troya contada desde el amor entre Patroclo y Aquiles.',
      en: 'The Trojan War told through the love between Patroclus and Achilles.',
    },
  },
  {
    id: 'corte-rosas',
    title: 'Una corte de rosas y espinas',
    author: 'Sarah J. Maas',
    year: 2015,
    pages: 456,
    genres: ['fantasy', 'romance'],
    moods: ['escape', 'unputdownable'],
    color: '#6B2D4A',
    synopsis: {
      es: 'Una cazadora mata a un lobo y es llevada como castigo a una tierra mágica de hadas.',
      en: 'A huntress kills a wolf and is taken, as punishment, to a magical faerie land.',
    },
  },
  {
    id: 'imperio-final',
    title: 'El imperio final',
    author: 'Brandon Sanderson',
    year: 2006,
    pages: 688,
    genres: ['fantasy'],
    moods: ['escape', 'unputdownable'],
    color: '#4A3B2A',
    synopsis: {
      es: 'En un mundo de ceniza gobernado por un tirano inmortal, una ladrona descubre poderes que pueden cambiarlo todo.',
      en: 'In a world of ash ruled by an immortal tyrant, a thief discovers powers that could change everything.',
    },
  },
  {
    id: 'piranesi',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    year: 2020,
    pages: 272,
    genres: ['fantasy', 'literary'],
    moods: ['escape', 'dark'],
    color: '#4E6E6A',
    synopsis: {
      es: 'Un hombre vive en una casa infinita de salas y mareas, y empieza a sospechar de lo único que conoce.',
      en: 'A man lives in an infinite house of halls and tides, and starts doubting the only world he knows.',
    },
  },
  {
    id: 'addie-larue',
    title: 'La vida invisible de Addie LaRue',
    author: 'V. E. Schwab',
    year: 2020,
    pages: 560,
    genres: ['fantasy', 'romance', 'historical'],
    moods: ['heartbreak', 'escape'],
    color: '#22303F',
    synopsis: {
      es: 'Addie hace un pacto para vivir para siempre, a cambio de que nadie la recuerde.',
      en: 'Addie makes a deal to live forever, at the price of being forgotten by everyone she meets.',
    },
  },
  {
    id: 'manana-manana',
    title: 'Mañana, y mañana, y mañana',
    author: 'Gabrielle Zevin',
    year: 2022,
    pages: 480,
    genres: ['literary', 'drama'],
    moods: ['heartbreak'],
    color: '#E07B53',
    synopsis: {
      es: 'Dos amigos crean videojuegos juntos durante treinta años de éxito, celos y amor.',
      en: 'Two friends make video games together across thirty years of success, envy and love.',
    },
  },
  {
    id: 'lecciones-quimica',
    title: 'Lecciones de química',
    author: 'Bonnie Garmus',
    year: 2022,
    pages: 432,
    genres: ['historical', 'drama'],
    moods: ['light'],
    color: '#2F8F83',
    synopsis: {
      es: 'Una química brillante en los años sesenta acaba presentando un programa de cocina que revoluciona a sus espectadoras.',
      en: 'A brilliant 1960s chemist ends up hosting a cooking show that quietly revolutionises its viewers.',
    },
  },
  {
    id: 'hamnet',
    title: 'Hamnet',
    author: "Maggie O'Farrell",
    year: 2020,
    pages: 384,
    genres: ['historical', 'literary', 'drama'],
    moods: ['heartbreak'],
    color: '#5E7B4C',
    synopsis: {
      es: 'La familia de Shakespeare frente a la pérdida de su hijo, antes de que existiera Hamlet.',
      en: "Shakespeare's family facing the loss of their son, before Hamlet was ever written.",
    },
  },
  {
    id: 'casa-espiritus',
    title: 'La casa de los espíritus',
    author: 'Isabel Allende',
    year: 1982,
    pages: 496,
    genres: ['literary', 'historical'],
    moods: ['escape', 'heartbreak'],
    color: '#8A4F7D',
    synopsis: {
      es: 'Tres generaciones de mujeres de la familia Trueba atraviesan un siglo de pasión y política.',
      en: 'Three generations of Trueba women live through a century of passion and politics.',
    },
  },
  {
    id: 'pensar-rapido',
    title: 'Pensar rápido, pensar despacio',
    author: 'Daniel Kahneman',
    year: 2011,
    pages: 672,
    genres: ['nonfiction'],
    moods: ['learn'],
    color: '#E9E4D8',
    synopsis: {
      es: 'Los dos sistemas que gobiernan cómo pensamos y por qué nos equivocamos tanto.',
      en: 'The two systems that drive how we think, and why we get things wrong so often.',
    },
  },
  {
    id: 'centrate',
    title: 'Céntrate',
    author: 'Cal Newport',
    year: 2016,
    pages: 304,
    genres: ['selfhelp', 'nonfiction'],
    moods: ['learn'],
    color: '#2C3E50',
    synopsis: {
      es: 'Por qué la concentración profunda es la habilidad más valiosa y cómo entrenarla.',
      en: 'Why deep focus is the most valuable skill today, and how to train it.',
    },
  },
  {
    id: 'ikigai',
    title: 'Ikigai',
    author: 'Héctor García y Francesc Miralles',
    year: 2016,
    pages: 208,
    genres: ['selfhelp'],
    moods: ['light', 'learn'],
    color: '#C0392B',
    synopsis: {
      es: 'Las claves japonesas para una vida larga y con propósito.',
      en: 'Japanese keys to a long and purposeful life.',
    },
  },
  {
    id: 'homo-deus',
    title: 'Homo Deus',
    author: 'Yuval Noah Harari',
    year: 2015,
    pages: 496,
    genres: ['nonfiction'],
    moods: ['learn'],
    color: '#1F4E79',
    synopsis: {
      es: 'Qué puede pasar con la humanidad cuando la tecnología nos dé poderes casi divinos.',
      en: 'What may happen to humanity once technology grants us almost godlike powers.',
    },
  },
  {
    id: 'gotico',
    title: 'Gótico',
    author: 'Silvia Moreno-Garcia',
    year: 2020,
    pages: 400,
    genres: ['horror', 'mystery'],
    moods: ['dark'],
    color: '#3B1F2B',
    synopsis: {
      es: 'Una joven viaja a una mansión decadente en las montañas de México para rescatar a su prima.',
      en: 'A young woman travels to a decaying mansion in the Mexican mountains to rescue her cousin.',
    },
  },
  {
    id: 'resplandor',
    title: 'El resplandor',
    author: 'Stephen King',
    year: 1977,
    pages: 688,
    genres: ['horror'],
    moods: ['dark', 'unputdownable'],
    color: '#7B1E1E',
    synopsis: {
      es: 'Una familia cuida de un hotel aislado durante el invierno, y el hotel tiene sus propios planes.',
      en: 'A family looks after an isolated hotel for the winter, and the hotel has plans of its own.',
    },
  },
  {
    id: 'orgullo-prejuicio',
    title: 'Orgullo y prejuicio',
    author: 'Jane Austen',
    year: 1813,
    pages: 432,
    genres: ['romance', 'literary'],
    moods: ['light'],
    color: '#9DB4A0',
    synopsis: {
      es: 'Elizabeth Bennet y el señor Darcy, o cómo la primera impresión casi siempre se equivoca.',
      en: 'Elizabeth Bennet and Mr Darcy, or how first impressions are almost always wrong.',
    },
  },
  {
    id: 'fahrenheit',
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    year: 1953,
    pages: 176,
    genres: ['scifi'],
    moods: ['dark', 'learn'],
    color: '#D35400',
    synopsis: {
      es: 'En un futuro donde los bomberos queman libros, uno de ellos empieza a leerlos.',
      en: 'In a future where firemen burn books, one of them starts reading them.',
    },
  },
];

/**
 * Runtime registry: the sample catalog plus every book fetched from a live
 * catalog (search, scan, photo) so the rest of the app can resolve it by id.
 */
const REGISTRY = new Map<string, Book>(CATALOG.map((b) => [b.id, b]));

export function getBook(id: string): Book | undefined {
  return REGISTRY.get(id);
}

/** Adds or updates books in the registry (keeps fields we already had, e.g. a found cover). */
export function registerBooks(books: Book[]) {
  for (const b of books) REGISTRY.set(b.id, { ...REGISTRY.get(b.id), ...b });
}

/** Books that didn't ship with the app — persisted so they survive a restart. */
export function remoteBooks(): Book[] {
  return [...REGISTRY.values()].filter((b) => b.source && b.source !== 'sample');
}
