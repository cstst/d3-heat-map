import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Graph extends Component {
  async componentDidMount() {
    const data = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
      .then(res => res.json())
    this.drawHeatMap(data);
  }

  drawHeatMap({ monthlyVariance, baseTemperature }) {
    const height = 600;
    const width = 1500;
    const margin = { top: 60, right: 30, bottom: 140, left: 120 };

    const svg = d3.select('#graph')
                  .append('svg')
                  .attr('height', height)
                  .attr('width', width);

    const years = monthlyVariance.map(yearData => yearData.year);
    const temps = monthlyVariance.map(yearData => yearData.variance);
    const tempDif = (d3.max(temps) - d3.min(temps)) / 11;

    const xScale = d3.scaleLinear()
                     .domain([d3.min(years), d3.max(years)])
                     .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain([1, 13])
                     .range([margin.top, height - margin.bottom]);
     
    const colors = [
      "#5E4FA2", 
      "#3288BD", 
      "#66C2A5", 
      "#ABDDA4", 
      "#E6F598", 
      "#FFFFBF", 
      "#FEE08B", 
      "#FDAE61", 
      "#F46D43", 
      "#D53E4F", 
      "#9E0142"
    ];                 
    const colorScale = d3.scaleQuantize()
                     .domain([d3.min(temps), d3.max(temps)])
                     .range(colors);

    const months = [
      'January', 
      'February', 
      'March', 
      'April', 
      'May', 
      'June', 
      'July', 
      'August', 
      'September', 
      'October', 
      'November', 
      'December'
    ];                 
    const monthScale = d3.scaleQuantize()
                          .domain([1, 12])
                          .range(months);
                    
    const cellHeight = (height - (margin.top + margin.bottom)) / 12;
    const cellWidth =  (width - (margin.left + margin.right)) / (d3.max(years) - d3.min(years));

    const tooltip = d3.select("#graph")
                      .append("div")
                      .attr("id", "tooltip");        

    svg.selectAll('rect')
       .data(monthlyVariance)
       .enter()
       .append('rect')
       .attr('class', 'cell')
       .attr('height', cellHeight)
       .attr('width',cellWidth)
       .attr('x', d => xScale(d.year))
       .attr('y', d => yScale(d.month))
       .attr('data-month', d => d.month)
       .attr('data-year', d => d.year)
       .attr('data-temp', d => d.variance + baseTemperature)
       .style('fill', d => colorScale(d.variance))
       .on('mouseover', (d, i) => {
          tooltip.text(`${monthScale(d.month)} ${d.year}\n${(Math.round((baseTemperature + d.variance) * 10) / 10)}°C\n${d.variance > 0 ? '+' : ''}${(Math.round(d.variance * 10) / 10)}°C`)
                 .attr('data-year', d.year)
                 .style("visibility", "visible")
        })
        .on("mousemove", () => {
          tooltip.style("top", (d3.event.pageY - 100)+"px")
                 .style("left",(d3.event.pageX - 40)+"px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden")
        });

    const yAxisScale = d3.scaleLinear()
                         .domain([.5, 12.5])
                         .range([margin.top, height - margin.bottom]);

    const yAxis = d3.axisLeft(yAxisScale)
                    .tickSizeOuter(0)
                    .tickFormat(d => monthScale(d));

    svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', `translate(${margin.left}, 0)`)
       .call(yAxis);
       
    svg.append("text")
       .attr('id', 'y-axis-label')
       .attr("transform", "rotate(-90)")
       .attr("x", (height / 2) * -1)
       .attr("y", margin.left / 2)
       .text("Month")
       
    const xAxis = d3.axisBottom(xScale)
                    .tickValues(d3.range(1760, 2015, 10))
                    .tickSizeOuter(0)
                    .tickFormat(d3.format('d'));   

    svg.append('g')
       .attr('id', 'x-axis')
       .attr('transform', `translate(0, ${height - margin.bottom})`)
       .call(xAxis);

    svg.append("text")
       .attr('id', 'x-axis-label')
       .attr("x", width / 2)
       .attr("y", height - (margin.bottom / 1.5))
       .text("Year") 

    svg.append('text')
       .attr('id', 'title')
       .attr('x', width / 2)
       .attr('y', margin.top / 2)
       .style("text-anchor", "middle")
       .text('Monthly Global Land-Surface Temperature')
    
    svg.append('text')
       .attr('id', 'description')
       .attr('x', (width / 2))
       .attr('y', margin.top / 1.2)
       .style("text-anchor", "middle")
       .text('1753-2015: Base Temperature 8.66°C');
       
    const legend = svg.append('g')
                      .attr('id', 'legend')

    const legendColorVals = [];
    for (let i = 0; i < 11; i++) {
      legendColorVals.push(d3.min(temps) + ((tempDif * i) + (tempDif / 2)));
    }

    legend.selectAll('rect')
          .data(legendColorVals)
          .enter()
          .append('rect')
          .attr('x', (d, i) => margin.left + (40 * i))
          .attr('y', height - (margin.bottom / 1.5))
          .attr('val', d => d)
          .attr('class', 'legend-cell')
          .attr('width', 40)
          .attr('height', 40)
          .style('fill', d => colorScale(d));

    const legendTickVals = []
    for (let i = 1; i < 11; i++) {
      legendTickVals.push(d3.min(temps) + (tempDif * i));
    }
    
    const legendScale = d3.scaleLinear()
                          .domain([legendTickVals[0], legendTickVals[legendTickVals.length - 1]])
                          .range([margin.left + 39, margin.left + 399]);

    const legendAxis = d3.axisBottom(legendScale)
                         .tickValues(legendTickVals)
                         .tickFormat( n => (n > 0 ? '+' : '') + (Math.round(n * 10) / 10));    
    legend.append("g")
          .attr('id', 'legend-axis')
          .attr("transform", `translate(0, ${height - (margin.bottom / 1.5) + 39})`)
          .call(legendAxis);

    legend.append("text")
          .attr('id', 'legend-axis-label')
          .attr("x", margin.left + 220)
          .attr("y", height - (margin.bottom / 1.5) + 80)
          .style("text-anchor", "middle")
          .text("Variance from Base Temperature (°C)")
  }
  
  render() {
    return (
      <div id="graph" />
    )
  }
}
