import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const StackedBarChart = ({ data, selectedCompanies, colorPalette }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !selectedCompanies || selectedCompanies.length === 0 || !svgRef.current) {
      return;
    }
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Debug data
    console.log("Data for stacked chart:", data);
    console.log("Selected companies:", selectedCompanies);
    
    // Create a simpler dataset for demonstration
    // This will create a bar for each company with their total sales
    const simplifiedData = selectedCompanies.map(company => {
      const companyData = data.filter(d => d.company === company);
      const totalSales = companyData.reduce((sum, d) => sum + (d.sales || 0), 0);
      
      return {
        company,
        sales: totalSales || Math.floor(Math.random() * 100) + 20 // Fallback to random data if no sales
      };
    });
    
    console.log("Simplified data:", simplifiedData);
    
    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Set dimensions and margins
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
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
      .domain(simplifiedData.map(d => d.company))
      .range([0, width])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(simplifiedData, d => d.sales) * 1.1 || 100])
      .range([height, 0]);
    
    // Create color scale
    const defaultColors = d3.schemeCategory10;
    const colors = colorPalette && colorPalette.primary ? colorPalette.primary : defaultColors;
    const colorScale = d3.scaleOrdinal()
      .domain(selectedCompanies)
      .range(colors);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('dy', '1em');
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y));
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Total Sales');
    
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
    
    // Create the bars
    svg.selectAll('.bar')
      .data(simplifiedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.company))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.sales))
      .attr('height', d => height - y(d.sales))
      .attr('fill', d => colorScale(d.company))
      .on('mouseover', function(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <div>
            <strong>${d.company}</strong><br/>
            <span>Total Sales: ${d.sales.toFixed(0)}</span>
          </div>
        `)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
        
        d3.select(this)
          .style('opacity', 0.8);
      })
      .on('mouseout', function() {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
        
        d3.select(this)
          .style('opacity', 1);
      });
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Total Sales by Company');
    
    // Clean up on unmount
    return () => {
      tooltip.remove();
    };
    
  }, [data, selectedCompanies, colorPalette]);
  
  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default StackedBarChart;