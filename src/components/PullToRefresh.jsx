import { useState, useRef, useEffect } from 'react';

export default function PullToRefresh({ disabled = false }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const threshold = 70;

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e) => {
      if (window.scrollY > 5) {
        isPulling.current = false;
        return;
      }
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current || isRefreshing) return;
      if (window.scrollY > 5) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 0) {
        const eased = Math.min(diff * 0.4, 120);
        setPullDistance(eased);
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      isPulling.current = false;
      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        setTimeout(() => window.location.reload(), 300);
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, disabled]);

  if (disabled || (pullDistance < 5 && !isRefreshing)) return null;

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <>
      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: Math.max(pullDistance / 2 - 22, 10),
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: progress,
        pointerEvents: 'none',
      }}>
        <div style={{
          width: 18,
          height: 18,
          border: '2.5px solid #E8302A',
          borderRightColor: 'transparent',
          borderRadius: '50%',
          animation: isRefreshing ? 'ptr-spin 0.6s linear infinite' : 'none',
          transform: isRefreshing ? 'none' : `rotate(${progress * 270}deg)`,
          transition: isRefreshing ? 'none' : 'transform 0.05s',
        }} />
      </div>
    </>
  );
}