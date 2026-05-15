"use client";

import { useState, useEffect } from "react";
import { Search, X, Gamepad2, Grid3X3, ChevronDown } from "lucide-react";

interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  iframe: string;
  thumbnail: string;
}

interface GamesData {
  games: Game[];
  categories: string[];
}

export default function GamesPage() {
  const [gamesData, setGamesData] = useState<GamesData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetch("/games.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("[v0] Games loaded:", data.games.length, "games");
        console.log("[v0] Game names:", data.games.map((g: Game) => g.name));
        setGamesData(data);
      })
      .catch((err) => console.error("Failed to load games:", err));
  }, []);

  const filteredGames = gamesData?.games.filter((game) => {
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const closeModal = () => setSelectedGame(null);

  if (!gamesData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Gamepad2 className="w-6 h-6 animate-pulse" />
          <span>Loading games...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Unblocked Games
                </h1>
                <p className="text-xs text-muted-foreground">
                  Play free games online
                </p>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-1 gap-3 sm:justify-end">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">{selectedCategory}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                    {gamesData.categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "text-popover-foreground"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredGames?.length || 0} games found
            {selectedCategory !== "All" && (
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {selectedCategory}
              </span>
            )}
          </p>
        </div>

        {/* Games Grid */}
        {filteredGames && filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => setSelectedGame(game)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg">No games found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        )}
      </main>

      {/* Game Modal */}
      {selectedGame && <GameModal game={selectedGame} onClose={closeModal} />}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}

function GameCard({ game, onClick }: { game: Game; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-left"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-secondary flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
        {game.thumbnail}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {game.name}
          </h3>
          <span className="px-2 py-0.5 bg-secondary text-xs text-muted-foreground rounded-full shrink-0">
            {game.category}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {game.description}
        </p>
      </div>

      {/* Play overlay */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <span className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          Play Now
        </span>
      </div>
    </button>
  );
}

function GameModal({ game, onClose }: { game: Game; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{game.thumbnail}</span>
            <div>
              <h2 className="font-bold text-lg text-card-foreground">
                {game.name}
              </h2>
              <p className="text-sm text-muted-foreground">{game.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Game iframe */}
        <div className="aspect-video bg-secondary">
          <iframe
            src={game.iframe}
            title={game.name}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">{game.description}</p>
        </div>
      </div>
    </div>
  );
}
