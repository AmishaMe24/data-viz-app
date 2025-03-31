import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data, selectedCompanies, colorPalette }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) {
      // If container exists but no data, show message
      if (svgRef.current && containerRef.current) {
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
          .text('No data available for the selected filters');
      }
      return;
    }
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    d3.select(containerRef.current).selectAll('.tooltip').remove();
    
    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Set margins
    const margin = { top: 40, right: 120, bottom: 60, left: 70 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Process data
    const processedData = data.map(d => ({
      ...d,
      date: d.date instanceof Date ? d.date : new Date(d.date),
      sales: typeof d.sales === 'number' ? d.sales : parseFloat(d.sales) || 0,
      revenue: typeof d.revenue === 'number' ? d.revenue : parseFloat(d.revenue) || 0
    }));
    
    // Filter by selected companies if provided
    const filteredData = selectedCompanies && selectedCompanies.length > 0
      ? processedData.filter(d => selectedCompanies.includes(d.company))
      : processedData;
    
    // Get unique companies
    const companies = Array.from(new Set(filteredData.map(d => d.company)))
      .filter(company => company !== undefined && company !== null);
    
    // Check if we have valid data to plot
    if (filteredData.length === 0 || companies.length === 0) {
      // Add a "No data available" message
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text('No data available for the selected filters');
      return;
    }
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData, d => d.date))
      .range([0, width])
      .nice();
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.sales) * 1.1])
      .range([height, 0])
      .nice();
    
    // Create color scale
    const defaultColors = d3.schemeCategory10;
    const colors = colorPalette && colorPalette.primary ? colorPalette.primary : defaultColors;
    const colorScale = d3.scaleOrdinal()
      .domain(companies)
      .range(colors);
    
    // Add X axis
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(6)
        .tickFormat(d3.timeFormat("%b %Y")))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
    
    // Add X axis label
    svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Date');
    
    // Add Y axis
    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));
    
    // Add Y axis label
    svg.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Sales Volume');
    
    // Add chart title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Sales Trends Over Time');
    
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
    
    // Group data by company and date
    const nestedData = d3.group(filteredData, d => d.company);
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);
    
    // Draw lines for each company
    nestedData.forEach((values, company) => {
      // Skip if company is undefined or null
      if (!company) return;
      
      // Sort data points by date
      const sortedValues = values.sort((a, b) => a.date - b.date);
      
      // Create a safe class name by replacing spaces and special characters
      const safeCompanyClass = company.toString().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      // Draw the line
      svg.append('path')
        .datum(sortedValues)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', colorScale(company))
        .attr('stroke-width', 2.5)
        .attr('d', line);
      
      // Add data points
      svg.selectAll(`.dot-${safeCompanyClass}`)
        .data(sortedValues)
        .enter()
        .append('circle')
        .attr('class', `dot-${safeCompanyClass}`)
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.sales))
        .attr('r', 4)
        .attr('fill', colorScale(company))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .on('mouseover', function(event, d) {
          // Enhance point on hover
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 7);
          
          // Show tooltip
          tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
          
          tooltip.html(`
            <div>
              <strong>${company}</strong><br/>
              <span>Date: ${d.date.toLocaleDateString()}</span><br/>
              <span>Sales: ${d.sales.toLocaleString()}</span>
            </div>
          `)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', function() {
          // Return point to normal
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r', 4);
          
          // Hide tooltip
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });
    });
    
    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 0)`);
    
    companies.forEach((company, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);
      
      // Add colored line for legend
      legendRow.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 20)
        .attr('y2', 0)
        .attr('stroke', colorScale(company))
        .attr('stroke-width', 2.5);
      
      // Add dot
      legendRow.append('circle')
        .attr('cx', 10)
        .attr('cy', 0)
        .attr('r', 4)
        .attr('fill', colorScale(company))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);
      
      // Add company name text
      legendRow.append('text')
        .attr('x', 30)
        .attr('y', 4)
        .style('font-size', '12px')
        .text(company);
    });
    
    // Add grid lines for better readability
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2)
      .select('path')
      .style('display', 'none');
    
    // Clean up on unmount
    return () => {
      if (tooltip) tooltip.remove();
    };
    
  }, [data, selectedCompanies, colorPalette]);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative" 
      style={{ 
        minHeight: '300px',
        height: '100%',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <svg 
        ref={svgRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block',
          maxWidth: '100%'
        }}
      ></svg>
    </div>
  );
};

export default LineChart;