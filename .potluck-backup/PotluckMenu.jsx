import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronRight, ExternalLink, BookOpen, Sparkles, Users as UsersIcon, Star, RefreshCw, Shield, Leaf } from 'lucide-react';
import { FOOD_CATEGORIES, DIETARY_OPTIONS, RECIPE_DATA, POTLUCK_NOTE } from '../constants';
import { ChristmasBackground } from './ChristmasBackground';
import { getAllRSVPs, syncFromGoogleSheets } from '../utils/storage';

export const PotluckMenu = () => {
  const [expandedCategories, setExpandedCategories] = useState(
    FOOD_CATEGORIES.map(() => true)
  );
  const [filterDietary, setFilterDietary] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [rsvps, setRsvps] = useState(() => getAllRSVPs());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showRecipeIdeas, setShowRecipeIdeas] = useState(null); // category id

  // Initial load from localStorage and sync from Sheets
  useEffect(() => {
    setRsvps(getAllRSVPs());
    // Auto-sync from Google Sheets on mount
    syncFromSheets();
  }, []);

  const syncFromSheets = async () => {
    setIsSyncing(true);
    try {
      const result = await syncFromGoogleSheets();
      if (result.success) {
        setRsvps(getAllRSVPs());
        setLastSync(new Date());
        console.log('[PotluckMenu] Synced from Google Sheets:', result);
      } else {
        console.warn('[PotluckMenu] Sync failed:', result.error);
      }
    } catch (error) {
      console.error('[PotluckMenu] Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleCategory = (index) => {
    setExpandedCategories(prev => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };

  const toggleDietaryFilter = (dietary) => {
    setFilterDietary(prev =>
      prev.includes(dietary)
        ? prev.filter(d => d !== dietary)
        : [...prev, dietary]
    );
  };

  const getFoodBringers = (food) => {
    const bringers = [];
    const attendingRsvps = rsvps.filter(r => r.attendance === 'yes');
    
    // Debug: log the food we're looking for
    console.log('[PotluckMenu] Looking for bringers for:', { 
      foodName: food.name, 
      foodCategory: food.category, 
      foodId: food.id,
      attendingCount: attendingRsvps.length 
    });
    
    attendingRsvps.forEach(rsvp => {
      console.log('[PotluckMenu] Checking RSVP:', rsvp.name, 'foodSelections:', rsvp.foodSelections.map(f => ({ name: f.name, category: f.category, id: f.id, dishName: f.dishName })));
      rsvp.foodSelections.forEach(f => {
        // Primary match by food ID (most reliable)
        const matchById = food.id && f.id === food.id;
        // Fallback match by name (in case ID format differs)
        const matchByName = f.name === food.name;
        
        if (matchById || matchByName) {
          console.log('[PotluckMenu] MATCH:', rsvp.name, 'bringing', food.name, 'dish:', f.dishName);
          bringers.push({ name: rsvp.name, dishName: f.dishName || '' });
        } else {
          console.log('[PotluckMenu] NO MATCH:', f.name, f.category, f.id, 'vs', food.name, food.category, food.id);
        }
      });
    });
    return bringers;
  };

  const isHostProvided = (food) => {
    if (food.isCustom) return false;
    const recipe = RECIPE_DATA[food.id];
    return recipe?.isHostProvided || false;
  };

  const getRecipeData = (food) => {
    if (food.isCustom) return null;
    return RECIPE_DATA[food.id];
  };

  // Build categories including custom foods from RSVPs
  const customFoodsByCategory = {};
  rsvps.filter(r => r.attendance === 'yes').forEach(rsvp => {
    rsvp.foodSelections.forEach(f => {
      if (f.isCustom) {
        if (!customFoodsByCategory[f.category]) {
          customFoodsByCategory[f.category] = [];
        }
        // Avoid duplicates by name
        if (!customFoodsByCategory[f.category].some(cf => cf.name === f.name)) {
          customFoodsByCategory[f.category].push(f);
        }
      }
    });
  });

  const filteredCategories = FOOD_CATEGORIES.map(category => ({
    ...category,
    options: [
      ...category.options.map(food => ({ ...food, category: category.id })),
      ...(customFoodsByCategory[category.id] || []).map(food => ({ ...food, category: category.id }))
    ]
  })).filter(cat => cat.options.length > 0);

  return (
    <section id='menu' className='relative min-h-screen pt-16 pb-20'>
      <ChristmasBackground showSnow={true} showOrnaments={true} />
      
      <div className='relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='text-center mb-4'>
          <h1 className='font-display text-xl sm:text-2xl font-bold text-xmas-cream mb-1'>
            Potluck Menu
          </h1>
          <p className='text-xs sm:text-sm text-xmas-cream/60 max-w-2xl mx-auto'>
            Click items for recipes, variations & who's bringing it.
          </p>
        </div>

        {/* Potluck Note */}
        <div className='mb-4 p-4 rounded-xl bg-xmas-green/10 border border-xmas-green/30 text-xmas-cream'>
          <p className='text-sm' dangerouslySetInnerHTML={{ __html: POTLUCK_NOTE }} />
        </div>

        <div className='card p-3 mb-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-xmas-cream/70'>Dietary:</span>
            <div className='flex flex-wrap gap-1.5 items-center'>
              {DIETARY_OPTIONS.slice(0, 4).map((dietary) => (
                <button
                  key={dietary.id}
                  onClick={() => toggleDietaryFilter(dietary.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${filterDietary.includes(dietary.id) ? 'bg-xmas-gold/20 border-xmas-gold text-xmas-gold' : 'bg-xmas-darkred/30 border-xmas-darkred/50 text-xmas-cream/70 hover:border-xmas-gold/50'}`}
                >
                  {dietary.icon} {dietary.label}
                </button>
              ))}
              <button
                onClick={syncFromSheets}
                disabled={isSyncing}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-1 ${isSyncing ? 'bg-xmas-gold/20 border-xmas-gold text-xmas-gold cursor-wait' : 'bg-xmas-darkred/30 border-xmas-darkred/50 text-xmas-cream/70 hover:border-xmas-gold/50'}`}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
              {lastSync && (
                <span className='text-xs text-xmas-cream/50 ml-1'>
                  Updated {lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <p className='text-xs text-xmas-cream/50 text-center mt-2'>
            {filteredCategories.reduce((sum, cat) => sum + cat.options.length, 0)} dishes across {filteredCategories.length} categories
          </p>
        </div>

        <div className='space-y-4'>
          {filteredCategories.map((category, catIndex) => (
            <div key={category.id} className='card overflow-hidden'>
              <button
                onClick={() => toggleCategory(catIndex)}
                className='w-full p-4 flex items-center justify-between bg-xmas-darkred/20 hover:bg-xmas-darkred/30 transition-colors'
              >
                <div className='flex items-center space-x-3 flex-1 min-w-0'>
                  <span className='text-3xl'>{category.icon}</span>
                  <div>
                    <h2 className='font-display text-xl text-xmas-gold'>{category.name}</h2>
                    <p className='text-sm text-xmas-cream/60'>
                      {category.options.length} option{category.options.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  {category.recipeSuggestions && category.recipeSuggestions.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRecipeIdeas(showRecipeIdeas === category.id ? null : category.id);
                      }}
                      className="text-xmas-gold/80 hover:text-xmas-gold text-xs font-medium flex items-center space-x-1 px-2 py-1 rounded border border-xmas-gold/30 bg-xmas-gold/5 transition-colors"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Recipe Ideas</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showRecipeIdeas === category.id ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                  {expandedCategories[catIndex] ? (
                    <ChevronUp className='w-6 h-6 text-xmas-gold transition-transform' />
                  ) : (
                    <ChevronDown className='w-6 h-6 text-xmas-gold transition-transform' />
                  )}
                </div>
              </button>

              {expandedCategories[catIndex] && (
                <div className='p-4 space-y-4'>
                  {/* Recipe Ideas Dropdown */}
                  {showRecipeIdeas === category.id && category.recipeSuggestions && (
                    <div className='p-3 bg-xmas-night/50 border border-xmas-gold/20 rounded-lg animate-fade-in'>
                      <p className='text-xs text-xmas-cream/60 mb-2'>Click a suggestion for inspiration, or bring your own dish:</p>
                      <div className='flex flex-wrap gap-2'>
                        {category.recipeSuggestions.map((suggestion, idx) => (
                          <span
                            key={idx}
                            className='px-3 py-1.5 bg-xmas-darkred/50 border border-xmas-gold/30 rounded-full text-xs text-xmas-cream cursor-default'
                          >
                            {suggestion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {category.options.map((food) => {
                    // Debug: log food properties for first few items
                    if (food.name.includes('Kalua') || food.name.includes('Lomi') || food.name.includes('Rice')) {
                      console.log('[PotluckMenu] Rendering FoodCard:', { name: food.name, category: food.category, id: food.id, isCustom: food.isCustom });
                    }
                    return (
                    <FoodCard
                      key={food.id}
                      food={food}
                      category={category.name}
                      recipeData={getRecipeData(food)}
                      bringers={getFoodBringers(food)}
                      isHostProvided={isHostProvided(food)}
                      onClick={() => setSelectedFood({ food, category: category.name, recipeData: getRecipeData(food), bringers: getFoodBringers(food), isHostProvided: isHostProvided(food) })}
                    />
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='mt-8 text-center'>
          <Link to='/rsvp' className='btn-primary inline-flex items-center space-x-2 text-base px-8 py-3'>
            <span>Ready to RSVP?</span>
            <ChevronRight className='w-5 h-5' />
          </Link>
        </div>
      </div>

      {/* Food Detail Modal */}
      {selectedFood && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm' onClick={() => setSelectedFood(null)}>
          <div className='bg-xmas-night border border-xmas-gold/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-down' onClick={e => e.stopPropagation()}>
            <div className='p-6'>
              <div className='flex items-start justify-between mb-6'>
                <div>
                  <div className='flex items-center space-x-2 text-xmas-gold mb-2'>
                    <span className='text-2xl'>{selectedFood.category === 'Pūpū (Appetizers)' && '🥢'}{selectedFood.category === 'Mea ʻAi Nui (Main Dishes) - The Kalua Pig' && '🐷'}{selectedFood.category === 'Sides & Starches' && '🍚'}{selectedFood.category === 'Mea ʻOno (Desserts)' && '🍰'}{selectedFood.category === 'Inu (Drinks)' && '🍹'}</span>
                    <span className='font-display text-xl'>{selectedFood.category}</span>
                    {selectedFood.isHostProvided && <span className='bg-xmas-gold text-xmas-night px-3 py-1 rounded-full text-sm font-bold'>✨ Host Provided</span>}
                  </div>
                  <h2 className='font-display text-2xl text-xmas-cream'>{selectedFood.food.name}</h2>
                </div>
                <button onClick={() => setSelectedFood(null)} className='p-2 text-xmas-cream/50 hover:text-xmas-gold transition-colors'>
                  <ChevronRight className='w-6 h-6' />
                </button>
              </div>

              {selectedFood.recipeData?.description && (
                <div className='mb-6 p-4 bg-xmas-darkred/20 rounded-xl border border-xmas-darkred/30'>
                  <p className='text-xmas-cream/80'>{selectedFood.recipeData.description}</p>
                </div>
              )}

              <div className='grid md:grid-cols-2 gap-6 mb-6'>
                {/* Recipes */}
                {selectedFood.recipeData?.recipes?.length > 0 && (
                  <div className='bg-xmas-night/50 border border-xmas-darkred/30 rounded-xl p-4'>
                    <h3 className='flex items-center space-x-2 text-xmas-gold mb-3'>
                      <BookOpen className='w-5 h-5' />
                      <span className='font-display text-lg'>Recipes</span>
                    </h3>
                    <ul className='space-y-2'>
                      {selectedFood.recipeData.recipes.map((recipe, i) => (
                        <li key={i} className='text-sm'>
                          <a href={recipe.url} target='_blank' rel='noopener noreferrer' className='flex items-center space-x-2 text-xmas-cream/80 hover:text-xmas-gold transition-colors'>
                            <span>{recipe.name}</span>
                            <span className='text-xmas-cream/40'>-</span>
                            <span className='text-xmas-cream/50'>{recipe.source}</span>
                            <ExternalLink className='w-3 h-3' />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Variations */}
                {selectedFood.recipeData?.variations?.length > 0 && (
                  <div className='bg-xmas-night/50 border border-xmas-darkred/30 rounded-xl p-4'>
                    <h3 className='flex items-center space-x-2 text-xmas-gold mb-3'>
                      <Sparkles className='w-5 h-5' />
                      <span className='font-display text-lg'>Variations</span>
                    </h3>
                    <ul className='space-y-1'>
                      {selectedFood.recipeData.variations.map((variation, i) => (
                        <li key={i} className='text-sm text-xmas-cream/70 flex items-center space-x-2'>
                          <span className='text-xmas-gold'>•</span>
                          <span>{variation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Notes & Bringers */}
              <div className='space-y-4'>
                {selectedFood.recipeData?.notes && (
                  <div className='bg-xmas-gold/10 border border-xmas-gold/30 rounded-xl p-4'>
                    <h3 className='flex items-center space-x-2 text-xmas-gold mb-2'>
                      <Star className='w-5 h-5' />
                      <span className='font-display text-lg'>Notes</span>
                    </h3>
                    <p className='text-xmas-cream/80'>{selectedFood.recipeData.notes}</p>
                  </div>
                )}

                {selectedFood.bringers.length > 0 && (
                  <div className='bg-xmas-green/10 border border-xmas-green/30 rounded-xl p-4'>
                    <h3 className='flex items-center space-x-2 text-xmas-green mb-2'>
                      <UsersIcon className='w-5 h-5' />
                      <span className='font-display text-lg'>Bringing this dish</span>
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {selectedFood.bringers.map((bringer, i) => (
                        <span key={i} className='px-3 py-1 bg-xmas-green/20 text-xmas-green rounded-full text-sm font-medium'>
                          {bringer.name}{bringer.dishName && <span className='text-xmas-cream/70 ml-1'>{' - ' + bringer.dishName}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFood.bringers.length === 0 && !selectedFood.isHostProvided && (
                  <div className='bg-xmas-cream/10 border border-xmas-cream/20 rounded-xl p-4 text-center'>
                    <p className='text-xmas-cream/70'>No one has signed up for this dish yet. Be the first!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const FoodCard = ({ food, category, bringers, isHostProvided, onClick }) => {
  // Get dietary tags and image for this food from recipe data
  const recipeData = RECIPE_DATA[food.id];
  const dietaryTags = recipeData?.dietaryTags || [];
  const imageUrl = recipeData?.imageUrl;
  
  return (
    <div className={`group relative bg-xmas-night/50 border rounded-xl hover:border-xmas-gold/50 hover:shadow-xl hover:shadow-xmas-gold/10 transition-all cursor-pointer ${isHostProvided ? 'border-xmas-gold/50 bg-xmas-gold/5 ring-2 ring-xmas-gold/20' : 'border-xmas-darkred/30'}`} onClick={onClick}>
      {isHostProvided && (
        <div className='absolute top-2 right-2 bg-xmas-gold text-xmas-night px-2 py-0.5 rounded text-xs font-bold'>HOST PROVIDED</div>
      )}
      {bringers.length > 0 && (
        <div className='absolute top-2 left-2 bg-xmas-green text-xmas-night px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1' title={bringers.map(b => b.name + (b.dishName ? ': ' + b.dishName : '')).join('; ')}>
          <UsersIcon className='w-3 h-3' />
          <span>{bringers.map(b => b.name).join(', ')}</span>
        </div>
      )}
      {imageUrl && (
        <div className="relative h-32 md:h-40 rounded-t-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder-food.jpg';
            }}
          />
          {isHostProvided && (
            <div className='absolute top-2 right-2 bg-xmas-gold text-xmas-night px-2 py-0.5 rounded text-xs font-bold'>HOST PROVIDED</div>
          )}
        </div>
      )}
      <div className={`p-4 ${imageUrl ? 'pt-2' : ''}`}>
        {!imageUrl ? (
          <div className='flex items-start space-x-3 mb-3'>
            <div className='w-12 h-12 rounded-lg bg-xmas-red/30 flex items-center justify-center text-2xl flex-shrink-0'>
              {category === 'Pūpū (Appetizers)' && '🥢'}
              {category === 'Mea ʻAi Nui (Main Dishes) - The Kalua Pig' && '🐷'}
              {category === 'Sides & Starches' && '🍚'}
              {category === 'Mea ʻOno (Desserts)' && '🍰'}
              {category === 'Inu (Drinks)' && '🍹'}
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className={`font-semibold text-xmas-cream ${isHostProvided ? 'text-xmas-gold' : ''}`}>{food.name}</h3>
              <p className='text-xs text-xmas-cream/50'>{category}</p>
              {/* Dietary badges */}
              {dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {dietaryTags.map((tag) => {
                    const dietaryOption = DIETARY_OPTIONS.find(d => d.id === tag);
                    return dietaryOption ? (
                      <span key={tag} className="inline-flex items-center space-x-1 px-2 py-0.5 bg-xmas-green/20 text-xmas-green text-xs rounded-full border border-xmas-green/30" title={dietaryOption.label}>
                        <span className="text-xs">{dietaryOption.icon}</span>
                        <span className="font-medium">{dietaryOption.label}</span>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='flex-1 min-w-0'>
            <h3 className={`font-semibold text-xmas-cream ${isHostProvided ? 'text-xmas-gold' : ''}`}>{food.name}</h3>
            <p className='text-xs text-xmas-cream/50'>{category}</p>
            {/* Dietary badges */}
            {dietaryTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {dietaryTags.map((tag) => {
                  const dietaryOption = DIETARY_OPTIONS.find(d => d.id === tag);
                  return dietaryOption ? (
                    <span key={tag} className="inline-flex items-center space-x-1 px-2 py-0.5 bg-xmas-green/20 text-xmas-green text-xs rounded-full border border-xmas-green/30" title={dietaryOption.label}>
                      <span className="text-xs">{dietaryOption.icon}</span>
                      <span className="font-medium">{dietaryOption.label}</span>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <div className='flex items-center justify-between text-sm px-4 pb-4'>
        <span className='text-xmas-gold font-medium'>
          Serves {food.serves}
        </span>
        <span className='text-xmas-cream/50'>Click for details</span>
      </div>
    </div>
  );
}; 
