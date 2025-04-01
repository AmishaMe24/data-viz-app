import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data, selectedCompanies, colorPalette }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      renderChart();
      setLoading(false);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      d3.select(containerRef.current).selectAll('.tooltip').remove();
    };
  }, [data, selectedCompanies, colorPalette]);
  
  const renderChart = () => {
    d3.select(svgRef.current).selectAll('*').remove();
    
    if (!data || data.length === 0 || !selectedCompanies || selectedCompanies.length === 0 || !svgRef.current) {
      const containerWidth = containerRef.current?.clientWidth || 300;
      const containerHeight = containerRef.current?.clientHeight || 300;
      
      const svg = d3.select(svgRef.current)
        .attr('width', containerWidth)
        .attr('height', containerHeight);
        
      svg.append('text')
        .attr('x', containerWidth / 2)
        .attr('y', containerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#666')
        .text('No data available');
        
      return;
    }

    const filteredData = data.filter(d => selectedCompanies.includes(d.company));
    
    if (filteredData.length === 0) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const svg = d3.select(svgRef.current)
        .attr('width', containerWidth)
        .attr('height', containerHeight);
        
      svg.append('text')
        .attr('x', containerWidth / 2)
        .attr('y', containerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#666')
        .text('No data available for selected companies');
        
      return;
    }
    
    const chartData = Array.from(
      d3.group(filteredData, d => d.company),
      ([company, values]) => ({
        company,
        total_revenue: d3.sum(values, d => d.total_revenue)
      })
    );
    
    if (chartData.every(d => d.total_revenue === 0)) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const svg = d3.select(svgRef.current)
        .attr('width', containerWidth)
        .attr('height', containerHeight);
        
      svg.append('text')
        .attr('x', containerWidth / 2)
        .attr('y', containerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#666')
        .text('No revenue data available');
        
      return;
    }
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    const margin = { top: 10, right: 10, bottom: 55, left: 10 }; 
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
    
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);
    
    const color = d3.scaleOrdinal()
      .domain(chartData.map(d => d.company))
      .range(colorPalette.primary);
    
    const pie = d3.pie()
      .sort(null)
      .value(d => d.total_revenue);
    
    const pieData = pie(chartData);
    
    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);
    
    const arcs = svg.selectAll('arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'arc');
    
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
    
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.company))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function(event, d) {
        const total = d3.sum(chartData, d => d.total_revenue);
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
        const total = d3.sum(chartData, d => d.total_revenue);
        return `${Math.round(d.data.total_revenue / total * 100)}%`;
      });
    
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
    
    const legendGroup = svg.append('g')
      .attr('transform', `translate(${-radius},${radius + 40})`);
    
    const total = d3.sum(chartData, d => d.total_revenue);
    
    const legendItems = legendGroup.selectAll('.legend')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        if (chartData.length <= 3) {
          return `translate(${i * (radius * 1.5)}, 0)`;
        }
        return `translate(0, ${i * 25})`;
      });
    
    legendItems.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => color(d.company));
    
    legendItems.append('text')
      .attr('x', 25)
      .attr('y', 12)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => {
        const percent = Math.round(d.total_revenue / total * 100);
        return `${d.company} (${percent}%)`;
      });
  };
  
  return (
    <div ref={containerRef} className="w-full h-full relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : null}
      <svg ref={svgRef} style={{ maxWidth: '100%', maxHeight: '100%' }}></svg>
    </div>
  );
};

export default PieChart;