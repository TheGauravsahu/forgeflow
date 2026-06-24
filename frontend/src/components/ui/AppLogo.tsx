import {
  Sparkles,
  Zap,
  Flame,
  Shield,
  Layers,
  Eye,
  Inbox,
  Settings,
  Heart
} from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';

interface AppLogoProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

const logoIcons = {
  Sparkles,
  Zap,
  Flame,
  Shield,
  Layers,
  Eye,
  Inbox,
  Settings,
  Heart
};

export function AppLogo({ className, size = 16, style }: AppLogoProps) {
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const IconComponent = logoIcons[activeTheme?.logoIcon || 'Sparkles'] || Sparkles;

  return <IconComponent className={className} size={size} style={style} />;
}
export default AppLogo;
