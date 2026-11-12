import { useContext } from 'react';
import { SiteContext } from './SiteContext.js';
export default function useSiteSettings() { return useContext(SiteContext); }
