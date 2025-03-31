import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data, selectedCompanies, colorPalette }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !selectedCompanies || selectedCompanies.length === 0 || !svgRef.current) {
      return;
    }
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Filter data based on selected companies
    const filteredData = data.filter(d => selectedCompanies.includes(d.company));
    
    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Set dimensions and margins - increase bottom margin for legend
    const margin = { top: 10, right: 10, bottom: 55, left: 10 }; 
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);
    
    // Color scale
    const color = d3.scaleOrdinal()
      .domain(filteredData.map(d => d.company))
      .range(colorPalette.primary);
    
    // Compute the position of each group on the pie
    const pie = d3.pie()
      .sort(null)
      .value(d => d.total_revenue);
    
    const pieData = pie(filteredData);
    
    // Build the pie chart
    const arc = d3.arc()
      .innerRadius(radius * 0.6) // Make it a donut chart by setting inner radius
      .outerRadius(radius * 0.9);
    
    // Build the arcs
    const arcs = svg.selectAll('arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'arc');
    
    // Add tooltip
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', 10);
    
    // Add the arcs
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.company))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function(event, d) {
        // Calculate percentage
        const total = d3.sum(filteredData, d => d.total_revenue);
        const percent = Math.round(d.data.total_revenue / total * 100);
        
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <div>
            <strong>${d.data.company}</strong><br/>
            <span>Revenue: $${d.data.total_revenue.toLocaleString()}</span><br/>
            <span>Percentage: ${percent}%</span>
          </div>
        `)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
        
        d3.select(this)
          .style('opacity', 0.8)
          .style('stroke-width', '3px');
      })
      .on('mouseout', function() {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
        
        d3.select(this)
          .style('opacity', 1)
          .style('stroke-width', '2px');
      });
    
    // Add percentage labels outside the arcs
    arcs.append('text')
      .attr('transform', d => {
        const pos = arc.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        const x = Math.cos(midAngle) * (radius * 0.95);
        const y = Math.sin(midAngle) * (radius * 0.95);
        return `translate(${x},${y})`;
      })
      .attr('dy', '.35em')
      .style('text-anchor', d => {
        const pos = arc.centroid(d);
        return (Math.atan2(pos[1], pos[0]) > 0 ? 'start' : 'end');
      })
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => {
        const total = d3.sum(filteredData, d => d.total_revenue);
        return `${Math.round(d.data.total_revenue / total * 100)}%`;
      });
    
    // Add center text
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0em')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Revenue');
    
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', '14px')
      .text('Distribution');
    
    // Add legend - position it centered below the chart with more space
    const legendGroup = svg.append('g')
      .attr('transform', `translate(${-radius},${radius + 40})`);
    
    // Calculate total for percentages
    const total = d3.sum(filteredData, d => d.total_revenue);
    
    // Create legend items with better spacing
    const legendItems = legendGroup.selectAll('.legend')
      .data(filteredData)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        // Position items in a horizontal row with more space between them
        if (filteredData.length <= 3) {
          return `translate(${i * (radius * 1.5)}, 0)`;
        }
        // Otherwise stack them vertically with more space
        return `translate(0, ${i * 25})`;
      });
    
    // Add colored squares
    legendItems.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => color(d.company));
    
    // Add company names with percentages
    legendItems.append('text')
      .attr('x', 25)  // Increase spacing between square and text
      .attr('y', 12)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => {
        const percent = Math.round(d.total_revenue / total * 100);
        return `${d.company} (${percent}%)`;
      });
    
    // Clean up on unmount
    return () => {
      tooltip.remove();
    };
    
  }, [data, selectedCompanies, colorPalette]);
  
  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} style={{ maxWidth: '100%', maxHeight: '100%' }}></svg>
    </div>
  );
};

export default PieChart;