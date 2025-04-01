import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const LineChart = ({
  data,
  selectedCompanies,
  colorPalette,
  startDate,
  endDate,
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      renderChart();
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [data, selectedCompanies, colorPalette, startDate, endDate]);

  const renderChart = () => {
    if (
      !data ||
      data.length === 0 ||
      !svgRef.current ||
      !containerRef.current
    ) {
      if (svgRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const svg = d3
          .select(svgRef.current)
          .attr("width", containerWidth)
          .attr("height", containerHeight);

        svg
          .append("text")
          .attr("x", containerWidth / 2)
          .attr("y", containerHeight / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text("No data available for the selected filters");
      }
      return;
    }

    d3.select(svgRef.current).selectAll("*").remove();
    d3.select(containerRef.current).selectAll(".tooltip").remove();

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const margin = { top: 40, right: 150, bottom: 80, left: 70 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const processedData = data.map((d) => ({
      ...d,
      date: d.date instanceof Date ? d.date : new Date(d.date),
      sales: d.total_sales || d.sales || 0,
      revenue: d.total_revenue || d.revenue || 0,
      company: d.company || "",
    }));

    const filteredData =
      selectedCompanies && selectedCompanies.length > 0
        ? processedData.filter((d) => selectedCompanies.includes(d.company))
        : processedData;

    const companies = Array.from(
      new Set(filteredData.map((d) => d.company))
    ).filter((company) => company !== undefined && company !== null);

    if (filteredData.length === 0 || companies.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("No data available for the selected filters");
      return;
    }

    const parseYearMonth = (dateStr) => {
      if (!dateStr) return { year: 2024, month: 1 };
      const parts = dateStr.split("-");
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10),
      };
    };

    const timeSeriesData = filteredData.map((d) => {
      const { year, month } = parseYearMonth(
        d.date instanceof Date
          ? `${d.date.getFullYear()}-${d.date.getMonth() + 1}`
          : d.date
      );

      return {
        year,
        month,
        yearMonth: year + month / 12,
        yearMonthStr: `${year}-${month.toString().padStart(2, "0")}`,
        company: d.company,
        count: 1,
        totalSales: d.sales,
        totalRevenue: d.revenue,
      };
    });

    timeSeriesData.sort((a, b) => a.yearMonth - b.yearMonth);

    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(timeSeriesData, (d) => d.yearMonth),
        d3.max(timeSeriesData, (d) => d.yearMonth),
      ])
      .range([0, width])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(timeSeriesData, (d) => d.totalSales) * 1.2])
      .range([height, 0])
      .nice();

    const defaultColors = d3.schemeCategory10;
    const colors =
      colorPalette && colorPalette.primary
        ? colorPalette.primary
        : defaultColors;
    const colorScale = d3.scaleOrdinal().domain(companies).range(colors);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(Math.min(8, timeSeriesData.length))
          .tickFormat((d) => {
            const year = Math.floor(d);
            const month = Math.round((d - year) * 12);
            return `${year}-${month.toString().padStart(2, "0")}`;
          })
      )
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Date");

    svg
      .append("g")
      .attr("class", "y-axis")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => d.toFixed(0))
      );

    svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Sales Volume");

    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(() => {
        if (startDate && endDate) {
          return `Sales Volume (${startDate} to ${endDate})`;
        } else if (startDate) {
          return `Sales Volume (From ${startDate})`;
        } else if (endDate) {
          return `Sales Volume (Until ${endDate})`;
        } else {
          return "Sales Volume by Month";
        }
      });

    const nestedData = d3.group(timeSeriesData, (d) => d.company);

    const line = d3
      .line()
      .x((d) => xScale(d.yearMonth))
      .y((d) => yScale(d.totalSales))
      .curve(d3.curveMonotoneX);

    nestedData.forEach((values, company) => {
      if (!company) return;

      const sortedValues = values.sort((a, b) => a.yearMonth - b.yearMonth);

      const safeCompanyClass = company
        .toString()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      svg
        .append("path")
        .datum(sortedValues)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", colorScale(company))
        .attr("stroke-width", 2.5)
        .attr("d", line);

      svg
        .selectAll(`.dot-${safeCompanyClass}`)
        .data(sortedValues)
        .enter()
        .append("circle")
        .attr("class", `dot-${safeCompanyClass}`)
        .attr("cx", (d) => xScale(d.yearMonth))
        .attr("cy", (d) => yScale(d.totalSales))
        .attr("r", 4)
        .attr("fill", colorScale(company))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .on("mouseover", function (event, d) {
          // Enhance point on hover
          d3.select(this).transition().duration(200).attr("r", 7);

          d3.select(".tooltip")
            .transition()
            .duration(200)
            .style("opacity", 0.9);

          d3.select(".tooltip")
            .html(
              `
            <div>
              <strong>${company || "All Companies"}</strong><br/>
              <span>Date: ${d.yearMonthStr}</span><br/>
              <span>Sales: ${d.totalSales.toLocaleString()}</span><br/>
              <span>Revenue: $${d.totalRevenue.toLocaleString()}</span>
            </div>
          `
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(500).attr("r", 4);

          // Hide tooltip
          d3.select(".tooltip").transition().duration(500).style("opacity", 0);
        });
    });

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 15}, 10)`);

    legend
      .append("rect")
      .attr("width", 120)
      .attr("height", companies.length * 25 + 10)
      .attr("fill", "white")
      .attr("stroke", "#e5e5e5")
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("x", -5)
      .attr("y", -5);

    companies.forEach((company, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 25 + 5})`);

      legendRow
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 20)
        .attr("y2", 0)
        .attr("stroke", colorScale(company))
        .attr("stroke-width", 2.5);

      legendRow
        .append("circle")
        .attr("cx", 10)
        .attr("cy", 0)
        .attr("r", 4)
        .attr("fill", colorScale(company))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

      legendRow
        .append("text")
        .attr("x", 30)
        .attr("y", 4)
        .style("font-size", "12px")
        .style("font-weight", "500")
        .text(company);
    });

    svg
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("stroke-opacity", 0.2)
      .select("path")
      .style("display", "none");

    return () => {
      if (d3.select(".tooltip")) d3.select(".tooltip").remove();
    };
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{
        minHeight: "300px",
        height: "100%",
        position: "relative",
        overflow: "visible",
      }}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : null}
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          maxWidth: "100%",
        }}
      ></svg>
    </div>
  );
};

export default LineChart;
