import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: number;
  title: string;
  cover: string;
  rating: number;
  genres: string[];
  type: string;
}

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  { id: 1, title: 'Solo Leveling', cover: 'https://picsum.photos/seed/solo/100/150', rating: 9.5, genres: ['Боевик', 'Фэнтези'], type: 'Манхва' },
  { id: 2, title: 'The Beginning After The End', cover: 'https://picsum.photos/seed/tbate/100/150', rating: 9.2, genres: ['Фэнтези', 'Приключения'], type: 'Манхва' },
  { id: 3, title: 'Omniscient Reader', cover: 'https://picsum.photos/seed/orv/100/150', rating: 9.4, genres: ['Фэнтези', 'Боевик'], type: 'Манхва' },
  { id: 4, title: 'Tower of God', cover: 'https://picsum.photos/seed/tog/100/150', rating: 8.9, genres: ['Приключения', 'Драма'], type: 'Манхва' },
  { id: 5, title: 'Solo Max-Level Newbie', cover: 'https://picsum.photos/seed/smln/100/150', rating: 8.7, genres: ['Боевик', 'Фэнтези'], type: 'Манхва' },
];

interface SearchWithAutocompleteProps {
  placeholder?: string;
  className?: string;
}

export default function SearchWithAutocomplete({ placeholder = "Поиск манхвы...", className }: SearchWithAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = MOCK_SEARCH_RESULTS.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex]);
        } else if (results.length > 0) {
          handleSelect(results[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(`/manhwa/${result.id}`);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <Icon name="X" size={18} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card ref={resultsRef} className="absolute top-full left-0 right-0 mt-2 z-50 max-h-[500px] overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            <div className="divide-y">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex gap-3">
                    <img
                      src={result.cover}
                      alt={result.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm truncate">{result.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <Icon name="Star" size={14} className="text-yellow-500" />
                          <span className="text-sm font-semibold">{result.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{result.type}</Badge>
                        {result.genres.slice(0, 2).map(genre => (
                          <Badge key={genre} variant="secondary" className="text-xs">{genre}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {results.length > 0 && (
              <div className="p-3 border-t bg-muted/30">
                <button
                  onClick={() => {
                    navigate(`/catalog?search=${encodeURIComponent(query)}`);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-2"
                >
                  Показать все результаты ({results.length})
                  <Icon name="ArrowRight" size={16} />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isOpen && query.trim().length > 0 && results.length === 0 && (
        <Card ref={resultsRef} className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Icon name="SearchX" size={48} className="mx-auto mb-2 opacity-50" />
            <p>Ничего не найдено</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
