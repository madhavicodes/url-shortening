/**
 * Social Sharing utilities for Twitter/X and Facebook
 */

export const shareOnTwitter = (url, text = 'Check out this shortened link!') => {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(targetUrl)}`;
  
  if (typeof window !== 'undefined') {
    window.open(twitterIntentUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  }
};

export const shareOnFacebook = (url) => {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    targetUrl
  )}`;
  
  if (typeof window !== 'undefined') {
    window.open(facebookIntentUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  }
};
