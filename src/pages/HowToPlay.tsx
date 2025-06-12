import { A, useNavigate } from '@solidjs/router'

const HowToPlay = () => {
  const navigate = useNavigate()

  return (
    <div class="min-h-[100dvh] flex flex-col items-center z-20 py-8 overflow-y-auto relative w-[95%] md:w-full mx-auto md:mx-0">
      <div class="absolute top-4 left-4 md:top-8 md:left-8 z-[52]">
        <A
          href="#"
          onClick={() => window.history.back()}
          class="text-primary text-sm md:text-lg font-bold uppercase tracking-wider hover:text-white transition-all duration-300"
        >
          Back
        </A>
      </div>
      <h1 class="text-5xl md:text-7xl font-extrabold text-primary uppercase tracking-tight transition-all duration-1000">
        How To Play
      </h1>

      <div class="mt-8 max-w-2xl text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-accent mb-4">The Mind-Bending Basics</h2>
        <p class="text-lg text-primary/80 leading-relaxed">
          Welcome to Mind Warp, where your brain cells will do the cha-cha! Think you're smart? Think again! This game
          will make you question your entire existence... or at least your ability to remember where you left your keys.
          🧠✨
        </p>
        <p class="mt-4 text-lg text-primary/80 leading-relaxed">
          Yes, it's a trivia game, but we've given it a cosmic makeover! Forget those boring old question cards - we've
          wrapped them in a sleek, modern design that'll make your eyes happy while your brain cries for mercy. Who said
          learning couldn't be aesthetically pleasing? 🎨✨
        </p>
        <p class="mt-4 text-lg text-primary/80 leading-relaxed">
          But here's the real magic: it's 10x more fun with friends! Watch as your besties' faces contort in confusion,
          or witness that one friend who somehow knows everything about quantum physics. Perfect for family gatherings,
          parties, or when you just want to prove you're the smartest person in the room (spoiler alert: you probably
          aren't). Gather your squad and prepare for some friendly intellectual warfare! 🎮👥
        </p>
      </div>

      <div class="mt-12 max-w-2xl text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-accent mb-4">Choose Your Adventure</h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-primary/10 p-6 rounded-lg hover:bg-primary/20 transition-all duration-300 cursor-pointer relative">
            <div class="absolute top-0 right-0 bg-accent text-white px-3 py-1 rounded-bl-lg text-sm font-bold">FUN</div>
            <h3 class="text-xl font-bold text-primary mb-3 mt-2">Quick Play (Offline)</h3>
            <p class="text-lg text-primary/80 leading-relaxed">
              Perfect for a spontaneous game night! Just click "New Game" and dive right in. No account needed - just
              pure, unadulterated trivia fun. Great for testing the waters or playing with friends in the same room. 🎲
            </p>
          </div>
          <div
            class="bg-accent/10 p-6 rounded-lg hover:bg-accent/20 transition-all duration-300 cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl"
            onclick={() => navigate('/register')}
          >
            <div class="absolute top-0 right-0 bg-primary text-void px-3 py-1 rounded-bl-lg text-sm font-bold">
              RECOMMENDED
            </div>
            <h3 class="text-xl font-bold text-accent mb-3 mt-2">Full Experience (Online)</h3>
            <p class="text-lg text-primary/80 leading-relaxed">
              Ready to level up? Create an account to unlock a universe of possibilities! Track your progress, save game
              history, and access a treasure trove of custom game templates created by our community and AI. Play with
              friends remotely, compete globally, and become a trivia legend! 🌟
            </p>
            <div class="mt-4 flex flex-wrap gap-2 justify-center">
              <span class="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">
                Global Leaderboards
              </span>
              <span class="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">Custom Templates</span>
              <span class="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">Remote Play</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 max-w-2xl text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-accent mb-4">How to Play Offline</h2>
        <div class="bg-primary/10 p-6 rounded-lg">
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <span class="bg-primary text-void w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </span>
              <p class="text-lg text-primary/80 leading-relaxed text-left">
                Start by adding players to your game. You can add as many players as you want, and each player will get
                their own turn to answer questions.
              </p>
            </div>
            <div class="flex items-start gap-3">
              <span class="bg-primary text-void w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </span>
              <p class="text-lg text-primary/80 leading-relaxed text-left">
                Create game rounds by adding questions. Each round can have multiple questions, and you can customize
                the difficulty and categories.
              </p>
            </div>
            <div class="flex items-start gap-3">
              <span class="bg-primary text-void w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </span>
              <p class="text-lg text-primary/80 leading-relaxed text-left">
                For each question, add possible answers. You can mark the correct answer, and the game will
                automatically calculate points based on whether players answer correctly.
              </p>
            </div>
            <div class="flex items-start gap-3">
              <span class="bg-primary text-void w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </span>
              <p class="text-lg text-primary/80 leading-relaxed text-left">
                The game handles everything else automatically! It manages player turns, calculates scores, and
                determines the winner at the end. Just focus on having fun and testing your knowledge! 🎮✨
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video: How to Play a Local Game */}
      <div class="mt-8 max-w-2xl w-full flex flex-col items-center">
        <h3 class="text-xl md:text-2xl font-bold text-primary mb-4">Watch: How to Play a Local Game</h3>
        <video
          class="w-full max-w-2xl rounded-lg border-2 border-primary shadow-lg bg-black h-[300px]"
          src="/local_game.mp4#t=0.001"
          controls
          preload="metadata"
          muted
          playsinline
          poster="./og-picture.jpg"
        >
          Sorry, your browser does not support embedded videos.
        </video>
      </div>

      <div class="mt-12 max-w-2xl text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-accent mb-4">How to Play Online</h2>
        <div class="bg-primary/10 p-6 rounded-lg">
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <span class="bg-primary text-void w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </span>
              <p class="text-lg text-primary/80 leading-relaxed text-left">
                First, create an account and log in. This will allow you to create games, join others' games, and track
                your progress.
              </p>
            </div>
            <div class="flex items-start gap-3">
              <span class="bg-primary text-void w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </span>
              <p class="text-lg text-primary/80 leading-relaxed text-left">
                Choose a game template to start with. You can use pre-made templates created by our AI, create your own,
                or browse through our growing collection of curated game templates.
              </p>
            </div>
            <div class="flex items-start gap-3">
              <span class="bg-primary text-void w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </span>
              <p class="text-lg text-primary/80 leading-relaxed text-left">
                Invite your friends to join the game. They'll need to be registered users to participate. You can send
                invites through email or share a game link.
              </p>
            </div>
            <div class="flex items-start gap-3">
              <span class="bg-primary text-void w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </span>
              <p class="text-lg text-primary/80 leading-relaxed text-left">
                Once everyone has joined, simply click the "Start Game" button to begin. You can pause the game at any
                time and continue later - your progress will be saved automatically. Enjoy playing together in
                real-time, competing for points, and having fun! 🎮✨
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video: How to Play a Remote Game */}
      <div class="mt-8 max-w-2xl w-full flex flex-col items-center">
        <h3 class="text-xl md:text-2xl font-bold text-primary mb-4">Watch: How to Play a Remote Game</h3>
        <video
          class="w-full max-w-2xl rounded-lg border-2 border-primary shadow-lg bg-black h-[300px]"
          src="/online_game.mp4#t=0.001"
          controls
          preload="metadata"
          muted
          playsinline
          poster="/og-picture.jpg"
        >
          Sorry, your browser does not support embedded videos.
        </video>
      </div>
    </div>
  )
}

export default HowToPlay
