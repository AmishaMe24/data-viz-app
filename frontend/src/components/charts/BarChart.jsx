import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, selectedCompanies, colorPalette }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    
    setTimeout(() => {
      renderChart();
      setLoading(false);
    }, 500);
    
    return () => {};
  }, [data, selectedCompanies, colorPalette]);
  
  const renderChart = () => {
    d3.select(svgRef.current).selectAll('*').remove();
    
    if (!data || !selectedCompanies || selectedCompanies.length === 0 || !svgRef.current) {
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
    
    const filteredData = data.filter(item => selectedCompanies.includes(item.company));
    
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
    
    const aggregatedData = Array.from(
      d3.group(filteredData, d => d.company),
      ([company, values]) => ({
        company,
        total_sales: d3.sum(values, d => d.total_sales)
      })
    );
    
    if (aggregatedData.every(d => d.total_sales === 0)) {
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
        .text('No sales data available');
        
      return;
    }
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    const margin = { top: 40, right: 20, bottom: 30, left: 50 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand()
      .domain(aggregatedData.map(d => d.company))
      .range([0, width])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.total_sales) * 1.1])
      .range([height, 0]);
    
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '12px');
    
    svg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px');
    
    svg.selectAll('.bar')
      .data(aggregatedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.company))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.total_sales))
      .attr('height', d => height - y(d.total_sales))
      .attr('fill', (d, i) => colorPalette.primary[i % colorPalette.primary.length]);
    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Total Sales by Company');
      
    svg.selectAll('.label')
      .data(aggregatedData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.company) + x.bandwidth() / 2)
      .attr('y', d => y(d.total_sales) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(d => d.total_sales);
  };
  
  return (
    <div ref={containerRef} className="w-full h-full relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : null}
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default BarChart;