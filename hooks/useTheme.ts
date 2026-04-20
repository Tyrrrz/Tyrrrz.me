import { useEffect, useMemo } from 'react';
import useLocalState from '~/hooks/useLocalState';
import useMedia from '~/hooks/useMedia';

const useTheme = () => {
  const [userPreferredTheme, setUserPreferredTheme] = useLocalState<'light' | 'dark' | null>(
    'theme',
    null
  );

  const systemPrefersDarkTheme = useMedia('(prefers-color-scheme: dark)');
  const systemPrefersLightTheme = useMedia('(prefers-color-scheme: light)');
  const systemPreferredTheme = useMemo<'light' | 'dark' | null>(() => {
    if (systemPrefersDarkTheme) {
      return 'dark';
    }

    if (systemPrefersLightTheme) {
      return 'light';
    }

    return null;
  }, [systemPrefersDarkTheme, systemPrefersLightTheme]);

  const theme =
    userPreferredTheme ||
    systemPreferredTheme ||
    // Default to dark to avoid flash banging users
    'dark';

  // Apply the theme class to <html> so Tailwind dark: variants work
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return useMemo(() => {
    return {
      userPreferredTheme,
      systemPreferredTheme,
      theme,
      setTheme: setUserPreferredTheme
    };
  }, [systemPreferredTheme, userPreferredTheme, theme, setUserPreferredTheme]);
};

export default useTheme;
