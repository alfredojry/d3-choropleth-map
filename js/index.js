// #Define  SVG
const width = 960, height = 700;

const svg = d3.select('body')
              .append('svg')
              .attr('width', width)
              .attr('height', height);

// #Search the education information by ID county
const searchById = (id, eduData) => eduData.filter(item => id === item.fips)[0];

// #Define the div for  the tooltip
const tooltip = d3.select('body')
                  .append('div')
                  .attr('class', 'div-tooltip')
                  .style('opacity', 0);

const showTooltip = (d, eduData) => {
    const infoCounty = searchById(d.id, eduData);
    tooltip.attr('id', 'tooltip')
           .attr('data-education', infoCounty.bachelorsOrHigher)
           .transition()
           .duration(200)
           .style('opacity', 0.9);
    tooltip.html(infoCounty.area_name + ', ' + infoCounty.state + '<br>' + infoCounty.bachelorsOrHigher + '%')
           .style('left', d3.event.pageX + 'px')
           .style('top', d3.event.pageY + 'px');
};

const hideTooltip = () => {
    tooltip.transition()
           .duration(200)
           .style('opacity', 0);
};

// #JSON's URL
const US_GEO_DATA = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
const US_EDU_DATA = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const VEN_GEO_DATA = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/venezuela/venezuela-estados.json';
const VEN_GEO_DATA2 = 'https://raw.githubusercontent.com/yoelvisj/JavaScript-Algorithms-and-Data-Structures-Projects/master/venezuela.geojson';

// #Path generator
const path = d3.geoPath();

// Load dataset
Promise.all([d3.json(US_GEO_DATA), d3.json(US_EDU_DATA)]).then(analyze);

function analyze(dataset) {
    const [geoData, eduData] = dataset

// #Color scale
    const minPercentage = d3.min(eduData, d => d.bachelorsOrHigher);
    const maxPercentage = d3.max(eduData, d => d.bachelorsOrHigher);

    const colorScale = d3.scaleLinear()
                         .domain([minPercentage, maxPercentage])
                         .range(['#FFFFFF', '#420049']); //'#800080'
                         //.range(d3.schemePurples)
                         //.interpolate(["#ff0000", "#0000ff"]);

// #Draw counties
    const topojsonObj = topojson.feature(geoData, geoData.objects.counties);
    const topojsonData = topojsonObj.features;
    svg.append('g')
       .attr('class', 'counties')
       .selectAll('path')
       .data(topojsonData)
       .enter()
       .append('path')
       .attr('class', 'county')
       .attr('d', path)
       .attr('data-fips', d => d.id)
       .attr('data-education', d => searchById(d.id, eduData).bachelorsOrHigher)
       .attr('fill', d => colorScale(searchById(d.id, eduData).bachelorsOrHigher))
       .on('mouseover', d => showTooltip(d, eduData))
       .on('mouseout',  hideTooltip);

// #Arithmetic progression for legend domain. an = a1 + (n - 1) * d
    const a1 = minPercentage;
    const an = maxPercentage;
    const n = 6;
    const d = (an - a1) / (n - 1);
    let arithProgression = [];
    for (let i = 1; i <= n; i++) {
        arithProgression.push(a1 + (i - 1) * d);
    }

// #Append legend
    const legendW = 200;
    const legendH = 40;

    const xScaleLegend = d3.scaleLinear()
                           .domain([a1, an])
                           .range([0, legendW]);

    const xAxisLegend = d3.axisBottom(xScaleLegend)
                          .tickValues(arithProgression) 
                          .tickFormat(d3.format('.1f'));

    const legend = svg.append('g')
	    	          .attr('id', 'legend')
                      .attr('transform', 'translate(70,' + (height - 70) + ')');

    legend.append('g')
          .selectAll('rect')
          .data(arithProgression)
          .enter()
          .append('rect')
          .attr('x', d => xScaleLegend(d) - legendW / (arithProgression.length - 1))
          .attr('y', 0)
          .attr('width', legendW / (arithProgression.length - 1))
          .attr('height', legendH)
          .attr('fill', d => colorScale(d));

    legend.append('g')
          .attr('transform', 'translate(0' + ',' + legendH + ')')
          .call(xAxisLegend);

    svg.append('path')
       .datum(topojson.mesh(geoData, geoData.objects.states, (a, b) => a !==  b))
       .attr('class', 'states')
       .attr('d', path)
       .style('fill', 'none')
       .style('stroke', '#FFFFFF');
}
