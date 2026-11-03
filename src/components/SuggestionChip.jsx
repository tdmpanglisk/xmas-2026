import { ExternalLink } from 'lucide-react';
import { getSuggestionRecipes } from '../constants';

// One recipe idea: dish name + recipe links (+ optional "Use this dish" button)
export const SuggestionChip = ({ suggestion, onUse }) => {
  const { recipes, searchUrl } = getSuggestionRecipes(suggestion);
  const linkClass = 'inline-flex items-center space-x-1 text-xs text-xmas-gold/90 hover:text-xmas-gold hover:underline';
  return (
    <div className="px-3 py-2 bg-xmas-darkred/50 border border-xmas-gold/30 rounded-lg text-xs text-xmas-cream max-w-full">
      <p className="font-medium break-words">{suggestion}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        {recipes.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <ExternalLink className="w-3 h-3" /><span>{r.name}</span>
          </a>
        ))}
        {recipes.length === 0 && (
          <a href={searchUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <ExternalLink className="w-3 h-3" /><span>Find recipes</span>
          </a>
        )}
        {onUse && (
          <button type="button" onClick={onUse} className="px-2 py-0.5 rounded-full border border-xmas-gold/50 text-xmas-gold hover:bg-xmas-gold/20 transition-colors">
            Use this dish
          </button>
        )}
      </div>
    </div>
  );
};
