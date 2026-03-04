import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

interface LoadingProgressProps {
  progress?: number;
  text?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'error' | 'warning';
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
};

const variantColors = {
  default: {
    primary: 'rgb(79 70 229)', 
    secondary: 'rgba(0, 0, 0, 0.1)'
  },
  success: {
    primary: 'rgb(34 197 94)',
    secondary: 'rgba(34, 197, 94, 0.1)'
  },
  error: {
    primary: 'rgb(239 68 68)', 
    secondary: 'rgba(239, 68, 68, 0.1)'
  },
  warning: {
    primary: 'rgb(234 179 8)', 
    secondary: 'rgba(234, 179, 8, 0.1)'
  }
};

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress = 66,
  text = "Procesando...",
  showText = true,
  size = 'md',
  variant = 'default',
  className = ""
}) => {
  const colors = variantColors[variant];
  
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <AnimatedCircularProgressBar
        max={100}
        min={0}
        value={progress}
        gaugePrimaryColor={colors.primary}
        gaugeSecondaryColor={colors.secondary}
        className={sizeClasses[size]}
      />
      {showText && (
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-gray-700">
            {text}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {progress}% completado
          </p>
        </div>
      )}
    </div>
  );
};