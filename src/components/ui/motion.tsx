
import React from 'react';

interface MotionProps {
  initial?: any;
  animate?: any;
  exit?: any;
  className?: string;
  children: React.ReactNode;
}

// Simple motion component that mimics Framer Motion's API but uses CSS transitions
export const motion = {
  div: ({ initial, animate, exit, className = "", children }: MotionProps) => {
    const [isAnimated, setIsAnimated] = React.useState(false);

    React.useEffect(() => {
      // Start animation after mount
      const timer = setTimeout(() => setIsAnimated(true), 50);
      return () => clearTimeout(timer);
    }, []);

    // Convert motion props to CSS styles
    const getStyles = () => {
      const styles: React.CSSProperties = {
        transition: 'all 0.3s ease-in-out',
      };

      if (!isAnimated) {
        // Initial state
        if (initial?.opacity !== undefined) styles.opacity = initial.opacity;
        if (initial?.y !== undefined) styles.transform = `translateY(${initial.y}px)`;
      } else {
        // Animated state
        if (animate?.opacity !== undefined) styles.opacity = animate.opacity;
        if (animate?.y !== undefined) styles.transform = `translateY(${animate.y}px)`;
      }

      return styles;
    };

    return (
      <div className={className} style={getStyles()}>
        {children}
      </div>
    );
  }
};
