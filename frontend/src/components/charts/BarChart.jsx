import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, selectedCompanies, colorPalette }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!data || !selectedCompanies || selectedCompanies.length === 0 || !svgRef.current) {
      return;
    }
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Filter data based on selected companies
    const filteredData = data.filter(company => selectedCompanies.includes(company.company));
    
    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Set dimensions and margins
    const margin = { top: 10, right: 10, bottom: 40, left: 40 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleBand()
      .domain(filteredData.map(d => d.company))
      .range([0, width])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.total_sales) * 1.1])
      .range([height, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '8px');
    
    // Add Y axis
    svg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '8px');
    
    // Add bars
    svg.selectAll('.bar')
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.company))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.total_sales))
      .attr('height', d => height - y(d.total_sales))
      .attr('fill', (d, i) => colorPalette.primary[i % colorPalette.primary.length]);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text('Total Sales by Company');
    
  }, [data, selectedCompanies, colorPalette]);
  
  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <svg ref={svgRef} style={{ maxWidth: '100%', maxHeight: '100%' }}></svg>
    </div>
  );
};

export default BarChart;