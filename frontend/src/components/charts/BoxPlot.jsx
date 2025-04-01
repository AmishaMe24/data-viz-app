import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BoxPlot = ({ data, selectedCompanies, colorPalette }) => {
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
    
    // Filter data based on selected companies
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
    
    // Group data by model
    const modelGroups = d3.group(filteredData, d => d.model);
    
    // Calculate statistics for each model
    const boxPlotData = Array.from(modelGroups, ([model, values]) => {
      const prices = values.map(d => +d.price || +d.total_revenue / +d.total_sales || 0).filter(p => p > 0);
      
      if (prices.length === 0) return null;
      
      prices.sort((a, b) => a - b);
      
      const q1 = d3.quantile(prices, 0.25);
      const median = d3.quantile(prices, 0.5);
      const q3 = d3.quantile(prices, 0.75);
      const iqr = q3 - q1;
      const min = Math.max(d3.min(prices), q1 - 1.5 * iqr);
      const max = Math.min(d3.max(prices), q3 + 1.5 * iqr);
      
      // Find outliers
      const outliers = prices.filter(p => p < min || p > max);
      
      return {
        model,
        company: values[0].company,
        min,
        q1,
        median,
        q3,
        max,
        outliers
      };
    }).filter(d => d !== null);
    
    if (boxPlotData.length === 0) {
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
        .text('No price data available for selected models');
        
      return;
    }
    
    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Set dimensions and margins
    const margin = { top: 40, right: 30, bottom: 20, left: 60 };
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
      .domain(boxPlotData.map(d => d.model))
      .range([0, width])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(boxPlotData, d => Math.max(d.max, ...d.outliers)) * 1.1])
      .range([height, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).tickFormat(d => `$${d3.format(',')(d)}`);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '10px');
    
    // Add Y axis
    svg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '10px');
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Price Distribution by Model');
    
    // Draw box plots
    const boxWidth = x.bandwidth();
    
    // For each box plot
    boxPlotData.forEach((d, i) => {
      const companyIndex = selectedCompanies.indexOf(d.company);
      const color = colorPalette.primary[companyIndex % colorPalette.primary.length];
      
      // Draw the vertical line from min to max
      svg.append('line')
        .attr('x1', x(d.model) + boxWidth / 2)
        .attr('x2', x(d.model) + boxWidth / 2)
        .attr('y1', y(d.min))
        .attr('y2', y(d.max))
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
      
      // Draw the box from q1 to q3
      svg.append('rect')
        .attr('x', x(d.model))
        .attr('y', y(d.q3))
        .attr('width', boxWidth)
        .attr('height', y(d.q1) - y(d.q3))
        .attr('fill', color)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('opacity', 0.7);
      
      // Draw the median line
      svg.append('line')
        .attr('x1', x(d.model))
        .attr('x2', x(d.model) + boxWidth)
        .attr('y1', y(d.median))
        .attr('y2', y(d.median))
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
      
      // Draw the min line (whisker)
      svg.append('line')
        .attr('x1', x(d.model) + boxWidth * 0.25)
        .attr('x2', x(d.model) + boxWidth * 0.75)
        .attr('y1', y(d.min))
        .attr('y2', y(d.min))
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
      
      // Draw the max line (whisker)
      svg.append('line')
        .attr('x1', x(d.model) + boxWidth * 0.25)
        .attr('x2', x(d.model) + boxWidth * 0.75)
        .attr('y1', y(d.max))
        .attr('y2', y(d.max))
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
      
      // Draw outliers
      d.outliers.forEach(outlier => {
        svg.append('circle')
          .attr('cx', x(d.model) + boxWidth / 2)
          .attr('cy', y(outlier))
          .attr('r', 3)
          .attr('fill', 'red')
          .attr('stroke', 'black')
          .attr('stroke-width', 1);
      });
    });
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

export default BoxPlot;