// add your JavaScript/D3 to this file
// Set chart dimensions and margins
const margin = { top: 30, right: 10, bottom: 50, left: 80 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Create SVG element
const svg = d3.select("#chart").append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define scales and axes
const x = d3.scaleBand().range([0, width]).padding(0.1);
const y = d3.scaleLinear().range([height, 0]);

let regionsData;
let years;

// Load data
d3.csv("https://raw.githubusercontent.com/lh3238/oilprice/tree/main/ASB2023_all/T52_pruned.csv").then(data => {
    years = data.columns.slice(1);
    regionsData = data.reduce((accumulator, d) => {
        accumulator[d.Region] = years.map(year => ({
            year: year,
            value: +d[year].replace(/,/g, '')
        }));
        return accumulator;
    }, {});

    // Set scale domains
    x.domain(regionsData['Total_world'].map(d => d.year));
    y.domain([0, d3.max(regionsData['Total_world'], d => d.value)]);

    // Add x and y axes to the chart
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text") // Select all x-axis labels
        .style("text-anchor", "end") // Set text anchor (alignment) to the end
        .attr("dx", "-.8em") // Adjust text position along x-axis
        .attr("dy", ".15em") // Adjust text position along y-axis
        .attr("transform", "rotate(-30)"); // Rotate labels

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    // Draw the 'Total_world' bar chart
    drawBarChart(regionsData['Total_world'], 'bar');

    // Add radio buttons for selecting regions, excluding 'Total_world' and empty string
    createRadioButtons(Object.keys(regionsData).filter(region => region !== 'Total_world' && region !== ''));

});

// Add a title to the chart
svg.append("text")
    .attr("x", width / 2)
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Crude Oil Export Trends");

// Add x-axis label
svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
    .style("text-anchor", "middle")
    .text("Years");

// Add y-axis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Crude Oil Export (1,000 b/d)");

// Function to draw the bar chart
function drawBarChart(data, className) {
    svg.selectAll(`.${className}`)
        .data(data)
        .join(
            enter => enter.append("rect")
                .attr("class", className)
                .attr("x", d => x(d.year))
                .attr("width", x.bandwidth())
                .attr("y", height) // Start from the bottom
                .attr("height", 0) // Initial height is 0
                .call(enter => enter.transition()
                    .duration(750)
                    .attr("y", d => y(d.value))
                    .attr("height", d => height - y(d.value))),
            update => update.call(update => update.transition()
                .duration(750)
                .attr("x", d => x(d.year))
                .attr("width", x.bandwidth())
                .attr("y", d => y(d.value))
                .attr("height", d => height - y(d.value))),
            exit => exit.call(exit => exit.transition()
                .duration(750)
                .attr("y", height)
                .attr("height", 0)
                .remove())
        );
}

// Function to create radio buttons
function createRadioButtons(regions) {
    const radioWrapper = d3.select("#radio-wrapper");
    regions.forEach(region => {
        const label = radioWrapper.append("label")
            .style("display", "block")
            .text(region);

        label.append("input")
            .attr("type", "radio")
            .attr("name", "region")
            .attr("value", region)
            .on("change", function () {
                if (this.checked) {
                    svg.selectAll(".overlay-bar").remove();
                    drawBarChart(regionsData[this.value], 'overlay-bar');
                }
            });
    });
}
