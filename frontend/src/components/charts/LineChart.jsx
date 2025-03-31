import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data, startDate, endDate, colorPalette }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) {
      return;
    }
    
    // Clear previous chart and tooltip
    d3.select(svgRef.current).selectAll('*').remove();
    d3.select(containerRef.current).selectAll('.tooltip').remove();
    
    // Get container dimensions with a minimum size fallback
    const containerWidth = Math.max(containerRef.current.clientWidth, 400);
    const containerHeight = Math.max(containerRef.current.clientHeight, 300);
    
    // Set dimensions and margins - increased margins to prevent overflow
    const margin = { top: 50, right: 120, bottom: 80, left: 80 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Create SVG with explicit dimensions
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Process dates to ensure they're proper Date objects
    const processedData = data.map(d => ({
      ...d,
      date: d.date instanceof Date ? d.date : new Date(d.date),
      sales: typeof d.sales === 'number' ? d.sales : parseFloat(d.sales) || 0 // Ensure sales is a number
    }));
    
    // Group data by date
    const groupedByDate = Array.from(d3.group(processedData, d => d.date))
      .map(([date, values]) => ({
        date,
        values
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get unique companies
    const companies = Array.from(new Set(processedData.map(d => d.company)))
      .filter(company => company !== undefined && company !== null);
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain([
        d3.min(processedData, d => new Date(d.date)),
        d3.max(processedData, d => new Date(d.date))
      ])
      .range([0, width])
      .nice(); // Round to nice round values
    
    // Find the maximum sales value for the y scale
    const maxSales = d3.max(processedData, d => d.sales);
    
    const yScale = d3.scaleLinear()
      .domain([0, maxSales * 1.1]) // Add 10% padding at the top
      .range([height, 0])
      .nice(); // Round to nice round values
    
    // Create color scale
    const defaultColors = d3.schemeCategory10;
    const colors = colorPalette && colorPalette.primary ? colorPalette.primary : defaultColors;
    const colorScale = d3.scaleOrdinal()
      .domain(companies)
      .range(colors);
    
    // Add X axis
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(6)
        .tickFormat(d3.timeFormat("%b'%y")))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
    
    // Add X axis label
    svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Year');
    
    // Add Y axis
    svg.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(yScale));
    
    // Add Y axis label
    svg.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Number of Sales');
    
    // Add chart title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Sales Over Time');
    
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
    
    // Prepare data for lines - one series per company
    const lineData = companies.map(company => {
      // Get all data points for this company
      const companyData = processedData
        .filter(d => d.company === company)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return {
        company: company || 'Unknown',
        values: companyData
      };
    });
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.sales))
      .curve(d3.curveMonotoneX); // Smoother curve
    
    // Draw lines for each company
    lineData.forEach(company => {
      // Check if we have valid data with at least 2 points
      if (!company.values || company.values.length < 2) return;
      
      // Ensure all data points have valid dates and sales values
      const validValues = company.values.filter(d => 
        d && d.date && !isNaN(d.date.getTime()) && 
        typeof d.sales === 'number' && !isNaN(d.sales)
      );
      
      if (validValues.length < 2) return; // Need at least 2 valid points
      
      // Draw the line with thicker stroke
      svg.append('path')
        .datum(validValues)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', colorScale(company.company))
        .attr('stroke-width', 3)
        .attr('d', line);
      
      // Add data points
      svg.selectAll(`.dot-${company.company.toString().replace(/[^\w-]/g, '-')}`)
        .data(validValues)
        .enter()
        .append('circle')
        .attr('class', `dot-${company.company.toString().replace(/[^\w-]/g, '-')}`)
        .attr('cx', d => xScale(new Date(d.date)))
        .attr('cy', d => yScale(d.sales))
        .attr('r', 5)
        .attr('fill', colorScale(company.company))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .on('mouseover', function(event, d) {
          // Enhance point on hover
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8);
          
          // Show tooltip
          tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
          
          tooltip.html(`
            <div>
              <strong>${company.company}</strong><br/>
              <span>Date: ${new Date(d.date).toLocaleDateString()}</span><br/>
              <span>Sales: ${d.sales}</span>
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
            .attr('r', 5);
          
          // Hide tooltip
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });
    });
    
    // Add legend
    const legendX = width - 100;
    const legendY = 0;
    const legendSpacing = 25;
    
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);
    
    companies.forEach((company, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * legendSpacing})`);
      
      // Add colored line for legend
      legendRow.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 20)
        .attr('y2', 0)
        .attr('stroke', colorScale(company))
        .attr('stroke-width', 3);
      
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
    
    // Clean up on unmount
    return () => {
      tooltip.remove();
    };
    
  }, [data, startDate, endDate, colorPalette]);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative" 
      style={{ 
        minHeight: '400px',
        height: '100%',
        position: 'relative',
        overflow: 'visible' // Changed from 'hidden' to ensure tooltips are visible
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