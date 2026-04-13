import { useState } from 'react';

export type Design = 'classic' | 'new';

export function useDesignPreference() {
  const [design, setDesignState] = useState<Design>(() => {
    return (localStorage.getItem('eslate_design') as Design) || 'new';
  });

  const [bannerSeen, setBannerSeenState] = useState<boolean>(() => {
    return localStorage.getItem('eslate_banner_seen') === 'true';
  });

  const setDesign = (d: Design) => {
    localStorage.setItem('eslate_design', d);
    window.location.reload();
  };

  const dismissBanner = () => {
    localStorage.setItem('eslate_banner_seen', 'true');
    setBannerSeenState(true);
  };

  return { design, setDesign, bannerSeen, dismissBanner };
}
