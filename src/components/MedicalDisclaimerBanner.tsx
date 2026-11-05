import React, { useState } from 'react';
import { AlertCircle, X, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../translations';

export const MedicalDisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { isTelugu } = useLanguage();

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200/80 dark:border-amber-900/60 px-4 py-2.5 sm:px-6 transition-colors">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="truncate sm:whitespace-normal">
            <strong className="font-semibold">{isTelugu ? 'విద్యా సంబంధ రిస్క్ స్క్రీనింగ్ సాధనం: ' : 'Academic Risk-Screening Tool: '}</strong>
            {isTelugu
              ? 'PCOSense లక్షణాల నుండి సంభావ్యతను అంచనా వేస్తుంది. ఇది వైద్య నిర్ధారణ లేదా చికిత్సను అందించదు.'
              : 'PCOSense uses machine learning to estimate risk probability from clinical symptoms. It does not provide a medical diagnosis or treatment prescription.'}
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/about"
            className="inline-flex items-center gap-1 font-semibold text-amber-900 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 hover:underline"
          >
            <span>{isTelugu ? 'మరింత సమాచారం' : 'Learn More'}</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
            title={isTelugu ? 'మూసివేయి' : 'Dismiss notice'}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
