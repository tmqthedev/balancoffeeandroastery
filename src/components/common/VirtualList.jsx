import React, { useMemo, useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';

const VirtualList = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  renderItem,
  className = '',
  overscan = 3,
  onScroll
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Calculate visible items
  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    if (!items.length) {
      return { visibleItems: [], totalHeight: 0, offsetY: 0 };
    }

    const itemCount = items.length;
    const totalH = itemCount * itemHeight;
    
    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItemCount = endIndex - startIndex + 1;
    const visible = items.slice(startIndex, startIndex + visibleItemCount).map((item, index) => ({
      item,
      index: startIndex + index
    }));

    const offsetTop = startIndex * itemHeight;

    return {
      visibleItems: visible,
      totalHeight: totalH,
      offsetY: offsetTop
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll(e);
    }
  }, [onScroll]);

  // Debounce scroll for performance
  const debouncedHandleScroll = useMemo(() => {
    let timeoutId;
    return (e) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleScroll(e), 16); // ~60fps
    };
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={debouncedHandleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={item.id || index}
              style={{ height: itemHeight }}
              className="virtual-list-item"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

VirtualList.propTypes = {
  items: PropTypes.array.isRequired,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  className: PropTypes.string,
  overscan: PropTypes.number,
  onScroll: PropTypes.func
};

export default VirtualList;