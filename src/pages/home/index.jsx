import { useEffect, useState } from 'react';
import { getProblem, getNewProblems } from '../../api/getproblem';
import { getGraphTags } from '../../api/learning.js';
import { getAnnouncement, getHomeShowText } from '../../api/homeShowText';
import useSiteSettings from '../../site/useSiteSettings.js';
import HomeSlideshow from '../../components/HomeSlideshow/HomeSlideshow.jsx';
import PracticeHome from './PracticeHome.jsx';

export default function Home() {
  const { theme } = useSiteSettings();
  const [totalProblems, setTotalProblems] = useState(null);
  const [latestProblems, setLatestProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [homeText, setHomeText] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let disposed = false;
    const load = async () => {
      // Fetch one row for the count, not a hundred complete problem statements.
      const results = await Promise.allSettled([
        getProblem({ pageIdx: 1, pageSize: 1 }),
        getNewProblems({ pageIdx: 1, pageSize: 10 }),
        getGraphTags(), getHomeShowText(), getAnnouncement(),
      ]);
      if (disposed) return;
      const value = (index, fallback) => results[index].status === 'fulfilled' ? results[index].value : fallback;
      setTotalProblems(value(0, null)?.totalCnt ?? null);
      setLatestProblems(value(1, null)?.result || []);
      setTopics(value(2, [])); setHomeText(value(3, '')); setAnnouncement(value(4, ''));
      setUnavailable(results.some(result => result.status === 'rejected'));
      setLoading(false);
    };
    void load();
    return () => { disposed = true; };
  }, []);
  const ThemeHome = theme.Home || PracticeHome;
  return <><HomeSlideshow /><ThemeHome {...{ totalProblems, latestProblems, topics, homeText, announcement, loading, unavailable }} /></>;
}
