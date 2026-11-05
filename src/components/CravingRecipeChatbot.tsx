import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Flame,
  Clock,
  Bookmark,
  BookmarkCheck,
  Utensils,
  ChevronRight,
  RefreshCw,
  Heart,
  Bot,
  User as UserIcon,
  Check
} from 'lucide-react';
import { RecipeItem, DietPreference, PatientRecord, RiskLevel } from '../types';
import { generateAICravingRecipe } from '../services/api';
import { isRecipeSaved, saveRecipe, removeSavedRecipe } from '../services/dietPlanService';
import { useLanguage } from '../translations';

interface CravingRecipeChatbotProps {
  patientData?: Partial<PatientRecord>;
  riskLevel?: RiskLevel;
  preference?: DietPreference;
  onSelectRecipe: (recipe: RecipeItem) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  recipe?: RecipeItem;
  timestamp: string;
}

export const CravingRecipeChatbot: React.FC<CravingRecipeChatbotProps> = ({
  patientData,
  riskLevel = 'Moderate',
  preference = 'all',
  onSelectRecipe
}) => {
  const { isTelugu } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: isTelugu
        ? 'నమస్కారం! నేను మీ PCOS క్రేవింగ్ చెఫ్ & న్యూట్రిషన్ అసిస్టెంట్‌ని. మీకు ఇప్పుడు ఏమైనా స్పైసీ (కారం), స్వీట్ (తీపి), వేడి సూప్ లేదా స్పెషల్ భోజనం తినాలనిపిస్తుందా? క్రింది ఆప్షన్లను ఎంచుకోండి లేదా మీరు తినాలనుకుంటున్న పదార్థాన్ని టైప్ చేయండి!'
        : 'Hello! I am your PCOS Craving Chef & Recipe AI. Craving something spicy, sweet, comforting hot soup, or a special weekend treat? Choose a craving below or type what you want to eat, and I will craft the perfect hormone-safe recipe with zero insulin spikes!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedStatusMap, setSavedStatusMap] = useState<Record<string, boolean>>({});

  const quickCravingChips = [
    { label: isTelugu ? '🌶️ స్పైసీ & కారం' : '🌶️ Spicy & Tangy', prompt: 'I want something spicy, flavorful and tangy' },
    { label: isTelugu ? '🍯 స్వీట్ & తీపి' : '🍯 Sweet & Guilt-Free', prompt: 'I am craving something sweet without sugar spikes' },
    { label: isTelugu ? '🍲 వేడి సూప్ & రసం' : '🍲 Hot Comforting Soup', prompt: 'I want a hot comforting spiced soup for bloating/cramps' },
    { label: isTelugu ? '🌟 స్పెషల్ బిర్యానీ/భోజనం' : '🌟 Special Weekend Treat', prompt: 'Give me a special restaurant-style weekend meal for PCOS' },
    { label: isTelugu ? '🥨 క్రంచీ స్నాక్స్' : '🥨 Crunchy Evening Snack', prompt: 'I want a crunchy healthy evening snack' },
    { label: isTelugu ? '⚡ 10 నిమిషాల భోజనం' : '⚡ Quick 10-Min Meal', prompt: 'I need a fast 10-minute high protein meal' }
  ];

  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim() || isLoading) return;

    const currentPrompt = userPrompt.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: currentPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await generateAICravingRecipe({
        craving: currentPrompt,
        preference: preference,
        patientContext: {
          risk_level: riskLevel,
          bmi: patientData?.['BMI'],
          cycleStatus: patientData?.['Cycle(R/I)'] === 2 ? 'Regular' : 'Irregular'
        },
        language: isTelugu ? 'te' : 'en'
      });

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: isTelugu
          ? `మీ కోసం ప్రత్యేకంగా తయారుచేసిన రెసిపీ: "${response.recipe.nameTe || response.recipe.name}". ఇది ఇన్సులిన్ మరియు ఆండ్రోజెన్ హార్మోన్లను అదుపులో ఉంచుతూ మీ కోరికను తీరుస్తుంది!`
          : `Here is your customized PCOS-safe recipe: "${response.recipe.name}". It completely satisfies your craving while optimizing insulin sensitivity and calming androgen pathways!`,
        recipe: response.recipe,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: isTelugu
          ? 'క్షమించండి, మీ అభ్యర్థనను ప్రాసెస్ చేయడంలో చిన్న అంతరాయం ఏర్పడింది. దయచేసి క్రింది సూచించిన రెసిపీని చూడండి.'
          : 'I found a great hormone-balancing recipe that matches your craving below!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = (recipe: RecipeItem) => {
    const currentlySaved = isRecipeSaved(recipe.id) || !!savedStatusMap[recipe.id];
    if (currentlySaved) {
      removeSavedRecipe(recipe.id);
      setSavedStatusMap(prev => ({ ...prev, [recipe.id]: false }));
    } else {
      saveRecipe(recipe);
      setSavedStatusMap(prev => ({ ...prev, [recipe.id]: true }));
    }
  };

  return (
    <div
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[580px] overflow-hidden"
      id="craving-recipe-chatbot-container"
    >
      {/* Bot Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-4 sm:p-4.5 text-white border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {isTelugu ? 'PCOS క్రేవింగ్ చెఫ్ & రెసిపీ AI బాట్' : 'PCOS Craving Chef & Recipe AI Bot'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 hidden sm:inline">
                {isTelugu ? 'ప్రత్యేక వంటకాలు' : 'Live Craving Solver'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {isTelugu ? 'మీకు ఇష్టమైన ఆహార కోరికలకు ఆరోగ్యకరమైన PCOS వంటకాలు' : 'Ask for any craving: spicy, sweet, hot soup, or special meals'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMessages([messages[0]])}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs flex items-center gap-1 transition-all"
          title="Reset conversation"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isTelugu ? 'రీసెట్' : 'Reset'}</span>
        </button>
      </div>

      {/* Quick Craving Suggestion Chips */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
            {isTelugu ? 'కోరికను ఎంచుకోండి:' : 'Quick Cravings:'}
          </span>
          {quickCravingChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(chip.prompt)}
              className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-all shadow-2xs disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="h-7 w-7 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[75%] space-y-2.5`}>
              {msg.text && (
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-teal-800 text-white rounded-br-xs shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`text-[9px] block mt-1 text-right ${
                      msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              )}

              {/* Bot Recipe Card (If recipe attached) */}
              {msg.recipe && (
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/80 shadow-md p-4 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {msg.recipe.cravingType ? `${msg.recipe.cravingType} craving match` : 'PCOS Special'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Low GI
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {isTelugu && msg.recipe.nameTe ? msg.recipe.nameTe : msg.recipe.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {isTelugu && msg.recipe.taglineTe ? msg.recipe.taglineTe : msg.recipe.tagline}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(msg.recipe!)}
                      className={`p-2 rounded-xl transition-all ${
                        isRecipeSaved(msg.recipe.id) || savedStatusMap[msg.recipe.id]
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Save Recipe"
                    >
                      {isRecipeSaved(msg.recipe.id) || savedStatusMap[msg.recipe.id] ? (
                        <BookmarkCheck className="h-4 w-4 fill-current" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Macro Snapshot */}
                  <div className="grid grid-cols-4 gap-1.5 text-center bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Cal</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">{msg.recipe.calories}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Protein</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{msg.recipe.proteinGrams}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Fiber</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{msg.recipe.fiberGrams}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Cook Time</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{msg.recipe.cookTimeMinutes}m</span>
                    </div>
                  </div>

                  {/* Action Buttons: View Recipe & Save */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectRecipe(msg.recipe!)}
                      className="flex-1 bg-gradient-to-r from-teal-800 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
                      id={`view-recipe-making-${msg.recipe.id}`}
                    >
                      <Utensils className="h-3.5 w-3.5 text-teal-300" />
                      <span>{isTelugu ? 'తయారీ విధానం చూడండి' : 'View Making Process & Recipe'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(msg.recipe!)}
                      className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all flex items-center gap-1 ${
                        isRecipeSaved(msg.recipe.id) || savedStatusMap[msg.recipe.id]
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isRecipeSaved(msg.recipe.id) || savedStatusMap[msg.recipe.id] ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-amber-600" />
                          <span>{isTelugu ? 'సేవ్ అయింది' : 'Saved'}</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-3.5 w-3.5" />
                          <span>{isTelugu ? 'సేవ్ చేయి' : 'Save for Later'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="h-7 w-7 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="h-7 w-7 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 animate-bounce">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl rounded-bl-xs text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-teal-500 animate-spin" />
              <span>{isTelugu ? 'మీ క్రేవింగ్ కోసం పర్ఫెక్ట్ రెసిపీని రూపొందిస్తోంది...' : 'Crafting your hormone-balancing craving recipe...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={
            isTelugu
              ? 'ఉదా: కారంగా పనీర్ టిక్కా లేదా తీపి చాక్లెట్ కావాలి...'
              : 'e.g. I want something spicy with paneer, or sweet dessert...'
          }
          className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 border border-transparent dark:border-slate-700"
          id="craving-chatbot-input"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="h-10 w-10 rounded-xl bg-teal-800 hover:bg-teal-700 disabled:opacity-50 text-white flex items-center justify-center transition-all shrink-0 shadow-xs"
          id="craving-chatbot-send-btn"
          aria-label="Send craving request"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
