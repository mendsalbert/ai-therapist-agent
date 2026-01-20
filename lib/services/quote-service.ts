interface Quote {
  text: string;
  author: string;
  category: string;
}

const QUOTES: Quote[] = [
  {
    text: "Progress, not perfection. Every small step counts.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "You are stronger than you think, and you've already come so far.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "It's okay to not be okay. Your feelings are valid.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "Healing is not linear. Be patient with yourself.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "Small daily improvements lead to remarkable results.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "You don't have to do this alone. Reach out when you need support.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "Self-care isn't selfish. Taking care of yourself helps you care for others.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "Your mental health matters. Make it a priority.",
    author: "Hope",
    category: "mental-health",
  },
  {
    text: "Every breath is a new beginning.",
    author: "Hope",
    category: "mindfulness",
  },
  {
    text: "You are worthy of peace, happiness, and all good things.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "The only way out is through. You've got this.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "Rest is productive. Recovery is part of the journey.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "Be gentle with yourself. You're doing the best you can.",
    author: "Hope",
    category: "compassion",
  },
  {
    text: "Growth happens when you step outside your comfort zone, gently.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Your struggles don't define you. Your resilience does.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "It's not about being positive all the time. It's about being real.",
    author: "Hope",
    category: "authenticity",
  },
  {
    text: "Connection heals. Reach out to someone who understands.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "You are not your thoughts. You are the observer of them.",
    author: "Hope",
    category: "mindfulness",
  },
  {
    text: "One day at a time. Sometimes, one moment at a time.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "Celebrate small wins. They add up to big changes.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "Your feelings are temporary. This moment will pass.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "Being vulnerable takes courage. You're brave for trying.",
    author: "Hope",
    category: "courage",
  },
  {
    text: "You have survived 100% of your bad days so far. Keep going.",
    author: "Hope",
    category: "resilience",
  },
  {
    text: "Self-compassion is the foundation of healing.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "The present moment is where life happens. Breathe into it.",
    author: "Hope",
    category: "mindfulness",
  },
  // Additional healing & mental health quotes
  {
    text: "Healing is not becoming who you were before; it's becoming who you are meant to be.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "Your mind deserves rest just as much as your body does.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "It's okay to slow down; growth doesn't disappear when you pause.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "You are not weak for needing help—you are human.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "Some days survival is success, and that is enough.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "Your feelings are valid, even when others don't understand them.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "Healing isn't linear, but every step still counts.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "You don't have to be strong all the time to be brave.",
    author: "Hope",
    category: "courage",
  },
  {
    text: "Peace begins when you stop fighting your own emotions.",
    author: "Hope",
    category: "mindfulness",
  },
  {
    text: "Asking for help is a form of self-respect.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "Your mental health matters more than your productivity.",
    author: "Hope",
    category: "mental-health",
  },
  {
    text: "Even broken things can let the light in.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "Rest is not laziness; it's recovery.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "You are allowed to take up space, even on your worst days.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Pain is real, but so is your ability to heal.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "You are not your diagnosis; you are your resilience.",
    author: "Hope",
    category: "resilience",
  },
  {
    text: "Some wounds need kindness, not pressure, to heal.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "It's okay if today you only did your best to breathe.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "Your story isn't over just because this chapter is hard.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "Healing happens when you listen instead of judge yourself.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "You don't need permission to care for your mental health.",
    author: "Hope",
    category: "mental-health",
  },
  {
    text: "The bravest thing you can do is be honest about how you feel.",
    author: "Hope",
    category: "courage",
  },
  {
    text: "Darkness does not cancel the existence of light.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "You are not failing—you are learning how to cope.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "Your mind deserves safety, not constant criticism.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "Progress can be quiet and still powerful.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "You are allowed to heal at your own pace.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "Mental health is not a destination; it's a daily practice.",
    author: "Hope",
    category: "mental-health",
  },
  {
    text: "Even on bad days, you are still worthy of love.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Strength can look like tears and rest.",
    author: "Hope",
    category: "resilience",
  },
  {
    text: "Healing starts when you stop comparing your journey to others.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "You deserve support, not silence.",
    author: "Hope",
    category: "supportive",
  },
  {
    text: "It's okay to choose peace over explanations.",
    author: "Hope",
    category: "mindfulness",
  },
  {
    text: "You are not behind; you are becoming.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Your scars are proof you survived.",
    author: "Hope",
    category: "resilience",
  },
  {
    text: "Some days the win is simply not giving up.",
    author: "Hope",
    category: "resilience",
  },
  {
    text: "You don't have to understand your pain to begin healing.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "You are more than what hurt you.",
    author: "Hope",
    category: "healing",
  },
  {
    text: "Choosing yourself is not selfish—it's necessary.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "Hope grows where compassion lives.",
    author: "Hope",
    category: "supportive",
  },
  // Self-Growth, Purpose & Resilience
  {
    text: "Small steps taken daily can change an entire life.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Consistency beats motivation when motivation fades.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "You don't need to see the whole path—just take the next step.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "Growth begins where comfort ends.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Your future self is watching your choices today.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Discipline is remembering what you want most.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "You become what you repeatedly choose.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Progress is built in moments no one applauds.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Becoming better is a quiet, personal decision.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "You don't rise by luck; you rise by effort.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "The person you're becoming will thank you for not quitting.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "You are allowed to outgrow people, places, and versions of yourself.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Focus on direction, not speed.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Every day is a chance to begin again.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "What you tolerate shapes your life.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Your mindset is a powerful place—don't rent it to negativity.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "Growth requires patience with yourself.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "You don't need perfection to make progress.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Courage is doing it even when fear is loud.",
    author: "Hope",
    category: "courage",
  },
  {
    text: "The work you do in silence creates loud results.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Change feels uncomfortable because it's unfamiliar.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "You are capable of more than your doubts suggest.",
    author: "Hope",
    category: "motivational",
  },
  {
    text: "Success starts with believing you are worthy of it.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "The best investment is in yourself.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "Becoming disciplined is an act of self-love.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "You don't need approval to pursue your purpose.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Your habits are shaping your tomorrow.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Fear shrinks when you move toward it.",
    author: "Hope",
    category: "courage",
  },
  {
    text: "You are allowed to choose growth over comfort.",
    author: "Hope",
    category: "growth",
  },
  {
    text: "Persistence turns dreams into reality.",
    author: "Hope",
    category: "motivational",
  },
  // Self-Worth, Love & Inner Strength
  {
    text: "You are enough, even before you improve.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Self-love is choosing yourself even when it's hard.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You don't have to earn rest or kindness.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Your value does not decrease because someone failed to see it.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You deserve love that feels safe.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Confidence grows when you stop betraying yourself.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You are worthy of care, simply because you exist.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Loving yourself is a daily commitment, not a feeling.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You don't need to be fixed to be loved.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Boundaries are proof of self-respect.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You are not too much—you're just not for everyone.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "The relationship you have with yourself sets the tone for all others.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You deserve the same compassion you give others.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Inner peace is a form of wealth.",
    author: "Hope",
    category: "mindfulness",
  },
  {
    text: "Choosing yourself is choosing healing.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "You don't owe anyone access to your energy.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Self-worth grows when comparison ends.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You are allowed to say no without explanation.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Your presence is valuable.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Loving yourself teaches others how to treat you.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You don't need validation to be valid.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Being kind to yourself is strength, not weakness.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You deserve a life that feels gentle.",
    author: "Hope",
    category: "self-care",
  },
  {
    text: "Protecting your peace is a powerful decision.",
    author: "Hope",
    category: "mindfulness",
  },
  {
    text: "You are more lovable than you realize.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Self-respect changes everything.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You don't have to shrink to be accepted.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You are allowed to choose yourself every time.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "Your existence is meaningful.",
    author: "Hope",
    category: "self-worth",
  },
  {
    text: "You are still becoming—and that's beautiful.",
    author: "Hope",
    category: "growth",
  },
];

const SHOWN_QUOTES_KEY = "hope_shown_quotes";

export function getRandomQuote(): Quote {
  if (typeof window === "undefined") {
    return QUOTES[0]; // SSR fallback
  }

  const shownQuotesJson = localStorage.getItem(SHOWN_QUOTES_KEY);
  const shownQuotes: string[] = shownQuotesJson ? JSON.parse(shownQuotesJson) : [];

  // If all quotes have been shown, reset
  if (shownQuotes.length >= QUOTES.length) {
    localStorage.removeItem(SHOWN_QUOTES_KEY);
    shownQuotes.length = 0;
  }

  // Filter out shown quotes
  const availableQuotes = QUOTES.filter(
    (quote) => !shownQuotes.includes(quote.text)
  );

  // If somehow all are shown, pick any random one
  if (availableQuotes.length === 0) {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[randomIndex];
  }

  // Pick a random quote from available ones
  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const selectedQuote = availableQuotes[randomIndex];

  // Mark as shown
  shownQuotes.push(selectedQuote.text);
  localStorage.setItem(SHOWN_QUOTES_KEY, JSON.stringify(shownQuotes));

  return selectedQuote;
}

export function resetShownQuotes(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SHOWN_QUOTES_KEY);
  }
}
