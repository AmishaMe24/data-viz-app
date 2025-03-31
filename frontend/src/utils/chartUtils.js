import * as d3 from 'd3';

// Create a tooltip
export const createTooltip = (container, event, content) => {
  const tooltip = d3.select(container)
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
    .style('pointer-events', 'none')
    .style('opacity', 0.9)
    .style('left', `${event.pageX + 10}px`)
    .style('top', `${event.pageY - 28}px`);
  
  tooltip.html(content);
  return tooltip;
};

// Format currency
export const formatCurrency = (value) => {
  return `$${Math.round(value).toLocaleString()}`;
};

// Format number with commas
export const formatNumber = (value) => {
  return value.toLocaleString();
};