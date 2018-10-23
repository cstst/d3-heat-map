import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Graph extends Component {
  async componentDidMount() {
    const data = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
      .then(res => res.json())
    console.log(data);
    this.drawHeatMap(data);
  }

  drawHeatMap({ monthlyVariance, baseTemperature }) {
    const height = 600,
          width = 1500,
          margin = {top: 60, right: 30, bottom: 150, left: 60},
          years = monthlyVariance.map(yearData => yearData.year),
          temps = monthlyVariance.map(yearData => yearData.variance),
          tempDif = (d3.max(temps) - d3.min(temps)) / 11,
          svg = d3.select('#graph')
                  .append('svg')
                  .attr('height', height)
                  .attr('width', width),
          xScale = d3.scaleLinear()
                     .domain([d3.min(years), d3.max(years)])
                     .range([margin.left, width - margin.right]),
          yScale = d3.scaleLinear()
                     .domain([1, 13])
                     .range([margin.top, height - margin.bottom]),
          colorScale = d3.scaleQuantize()
                     .domain([d3.min(temps), d3.max(temps)])
                     .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598", "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]),
          monthScale = d3.scaleQuantize()
                          .domain([1, 13])
                          .range(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', '']),
          xAxis = d3.axisBottom(xScale)
                    .tickValues(d3.range(1760, 2015, 10))
                    .tickFormat(d3.format('d')),
          yAxis = d3.axisLeft(yScale)
                    .tickFormat(d => monthScale(d)),
          tooltip = d3.select("#graph")
                      .append("div")
                      .attr("id", "tooltip")

    svg.selectAll('rect')
       .data(monthlyVariance)
       .enter()
       .append('rect')
       .attr('class', 'rect')
       .attr('height', (height - (margin.top + margin.bottom)) / 12)
       .attr('width', width / (d3.max(years) - d3.min(years)))
       .attr('x', d => xScale(d.year))
       .attr('y', d => yScale(d.month))
       .attr('month', d => monthScale(d.month))
       .style('fill', d => colorScale(d.variance))
       .on('mouseover', (d, i) => {
          tooltip.text(`${monthScale(d.month)} ${d.year}\n${(Math.round((baseTemperature + d.variance) * 10) / 10)}°C\n${d.variance > 0 ? '+' : ''}${(Math.round(d.variance * 10) / 10)}°C`)
                 .style("visibility", "visible")
        })
      .on("mousemove", () => {
        tooltip.style("top", (d3.event.pageY - 100)+"px")
               .style("left",(d3.event.pageX - 40)+"px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden")
      });

    svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', `translate(${margin.left}, 0)`)
       .call(yAxis);
       
    svg.append('g')
       .attr('transform', `translate(0, ${height - margin.bottom})`)
       .attr('id', 'x-axis')
       .call(xAxis);

    svg.append('text')
       .attr('x', width / 3)
       .attr('y', margin.top / 2)
       .attr('id', 'title')
       .text('Monthly Global Land-Surface Temperature')
    
    svg.append('text')
       .attr('x', (width / 3) + 60)
       .attr('y', margin.top / 1.2)
       .attr('id', 'subtitle')
       .text('1753-2015: Base Temperature 8.66℃');
    
    const legendColorVals = [],
          legendTickVals = [];
    for (let i = 0; i < 11; i++) {
      legendColorVals.push(d3.min(temps) + ((tempDif * i) + (tempDif / 2)));
      if (i > 0) {
        legendTickVals.push(d3.min(temps) + (tempDif * i));
      }   
    }
    console.log(legendTickVals)
    const legend = svg.append('g')
                      .attr('id', 'legend')

    legend.selectAll('rect')
          .data(legendColorVals)
          .enter()
          .append('rect')
          .attr('x', (d, i) => margin.left + (40 * i))
          .attr('y', height - (margin.bottom / 2))
          .attr('val', d => d)
          .attr('class', 'legend-rect')
          .attr('width', 40)
          .attr('height', 40)
          .style('fill', d => colorScale(d));
    
    const legendScale = d3.scaleLinear()
                          .domain([legendTickVals[0], legendTickVals[legendTickVals.length - 1]])
                          .range([margin.left + 39, margin.left + 399]);

    const legendAxis = d3.axisBottom(legendScale)
                         .tickValues(legendTickVals)
                         .tickFormat( n => (n > 0 ? '+' : '') + (Math.round(n * 10) / 10) + '°');    
    legend.append("g")
          .attr('id', 'legend-axis')
          .attr("transform", `translate(0, ${height - (margin.bottom / 2) + 39})`)
          .call(legendAxis);
    


  }
  
  render() {
    return (
      <div id="graph">
        
      </div>
    )
  }
}
