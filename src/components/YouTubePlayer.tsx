import React, { useState } from 'react';
import { Play, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useLanguage } from '../translations';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  className?: string;
  autoPlay?: boolean;
}

export const extractYouTubeVideoId = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();
  // Exact 11 char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  // Match v= parameter
  const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vMatch && vMatch[1]) return vMatch[1];

  // Match youtu.be/
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Match embed/
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // Fallback match for any 11 character string
  const fallbackMatch = trimmed.match(/([a-zA-Z0-9_-]{11})/);
  return fallbackMatch ? fallbackMatch[1] : trimmed;
};

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title,
  className = '',
  autoPlay = false
}) => {
  const { isTelugu } = useLanguage();
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Clean video ID (robust extraction)
  const cleanVideoId = extractYouTubeVideoId(videoId);
  const watchUrl = cleanVideoId ? `https://www.youtube.com/watch?v=${cleanVideoId}` : '#';
  // Use privacy-enhanced youtube-nocookie.com domain which bypasses third-party cookie restrictions in iframes
  const embedUrl = cleanVideoId
    ? `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`
    : '';

  if (!cleanVideoId) {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-950 aspect-video shadow-md border border-slate-800 flex flex-col items-center justify-center p-4 text-center text-slate-400 ${className}`}>
        <AlertCircle className="h-8 w-8 text-amber-400 mb-2" />
        <p className="text-xs font-semibold">
          {isTelugu ? 'వీడియో లింక్ అందుబాటులో లేదు' : 'No video available for this session'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-slate-950 aspect-video shadow-md border border-slate-800 group ${className}`}
      id={`yt-player-container-${cleanVideoId}`}
    >
      {isPlaying ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10">
              <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
            </div>
          )}
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
            id={`yt-iframe-${cleanVideoId}`}
          />
          {/* External watch pill in case of embedding restrictions */}
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 z-20 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-900 text-white text-[10px] font-bold border border-slate-700/80 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs shadow-md"
            title="Open and watch directly on YouTube"
          >
            <span>{isTelugu ? 'యూట్యూబ్‌లో చూడండి' : 'Open in YouTube'}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </>
      ) : (
        <div
          className="relative w-full h-full cursor-pointer"
          onClick={() => setIsPlaying(true)}
          id={`yt-thumbnail-click-${cleanVideoId}`}
        >
          <img
            src={`https://img.youtube.com/vi/${cleanVideoId}/hqdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600';
            }}
          />

          {/* Quick open in YouTube link */}
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-slate-950/80 hover:bg-red-600 text-white text-[11px] font-semibold border border-slate-700/60 flex items-center gap-1.5 transition-colors shadow-md backdrop-blur-xs"
            title="Open video in YouTube"
          >
            <span>{isTelugu ? 'యూట్యూబ్‌లో తెరవండి' : 'YouTube'}</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="h-12 w-12 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0 cursor-pointer"
                aria-label={`Play ${title}`}
                id={`play-btn-${cleanVideoId}`}
              >
                <Play className="h-6 w-6 fill-current translate-x-0.5" />
              </button>
              <div>
                <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                  {isTelugu ? 'వీడియో చూడండి' : 'Watch Clinical Session'}
                </p>
                <h4 className="text-sm font-bold text-white line-clamp-1">{title}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-slate-200 p-6 text-center z-20 space-y-3">
          <AlertCircle className="h-8 w-8 text-amber-400" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">
              {isTelugu ? 'వీడియో నేరుగా ప్లే కాలేదు' : 'Embed playback restricted'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              {isTelugu
                ? 'బ్రౌజర్ లేదా యూట్యూబ్ సెట్టింగ్‌ల వల్ల నేరుగా ప్లే కాలేదు. పూర్తి HD లో యూట్యూబ్‌లో చూడండి.'
                : 'YouTube or browser iframe security restricted direct playback. You can watch the full routine directly on YouTube.'}
            </p>
          </div>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            <span>{isTelugu ? 'యూట్యూబ్‌లో చూడండి' : 'Watch on YouTube'}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
