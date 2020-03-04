/* BarChart - Object constructor function
 * Todo: 
 *  + display bars for each category
 *  + display stacked bars for fat & carbs
 *  + scale according to daily values
 */

BarChart = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;

    // initialize the visualization
    this.initVis();
}

/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */
BarChart.prototype.initVis = function() {
    var vis = this;

    // set the margins
    vis.margin = { top: 30, right: 50, bottom: 40, left: 100 };

    // set the width and the height
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = vis.width*1.7;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement)
        // add the id of the chart
        .append("svg")
        .attr('id', 'food-info-barchart')
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

        // make chart responsive
        .call(responsivefy)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width])

    vis.y = d3.scaleBand()
        .rangeRound([0, vis.height])
        .padding(0.5);

    vis.yAxis = d3.axisLeft(vis.y);

    // title
    vis.title = vis.svg
        .append('text')
        .attr('class', 'bar-title')
        .attr('fill', '#3c6478')
        //.attr('font-family', 'Quicksand')
        .attr('x', -vis.margin.left)
        .attr('y', -vis.margin.top / 2)
        .text('Percentage of your daily values')

    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */
BarChart.prototype.wrangleData = function() {
    var vis = this;

    //console.log(vis.data);
    // change data to float values
    /*vis.data.forEach((food, i) => {
        var foodInfo = food.food_info

        Object.keys(foodInfo).forEach(key => {
            var foodStat = parseFloat(foodInfo[key])

            // we don't want the serving sizes because they are not heterogenous
            if (!isNaN(foodStat) && key != 'serving_size' && key != 'ingredients') {

                // iterate over all numeric food stats and update the data 
                foodInfo[key] = foodStat;
            }
        });
        food.isInTray = false;
    });*/
    // Turn object data into array
    var foodInfo = vis.data.food_info;
    //console.log(foodInfo)
    Object.keys(foodInfo).forEach(key => {
            var foodStat = parseFloat(foodInfo[key])

            // we don't want the serving sizes because they are not heterogenous
            if (!isNaN(foodStat) && key != 'serving_size' && key != 'ingredients') {

                // iterate over all numeric food stats and update the data 
                foodInfo[key] = foodStat;
            }
        });

    vis.displayData = Object.keys(foodInfo).filter(key => (!isNaN(vis.data.food_info[key])))
        .map(key => [key, Math.round(vis.data.food_info[key] / recommendedValue[key] * 100)]);

    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */
BarChart.prototype.updateVis = function() {
    var vis = this;


    // remove recommended daily value line
    if (vis.line) {
        d3.selectAll('line')
            .remove();

        d3.selectAll('.recvalue-title')
            .remove()
    }

    // define transition
    const t = d3.transition()
        .duration(800);

    // Update scale domains
    vis.y.domain(vis.displayData.map((d) => d[0]));
    vis.x.domain([0, d3.max([100, d3.max(vis.displayData.map(d => d[1]))])])

    // draw axis
    vis.svg.append("g")
        .attr("class", "y-axis axis");
    //.transition(t)

    // Draw rectangles
    vis.rect = vis.svg.selectAll('rect')
        .data(vis.displayData);

    // enter
    vis.rect
        .enter()
        .append('rect')

        // update
        .merge(vis.rect)
        //.transition(t)
        .attr('x', 0)
        .attr('y', (d) => vis.y(d[0]))
        .attr('width', (d) => vis.x(d[1]))
        .attr('height', vis.y.bandwidth())
        .attr('class', 'bar')
        .attr('fill', d => d[1] < 100 ? '#3c6478' : '#DC143C');

    // exit
    vis.rect
        .exit()
        .remove()

    // draw labels
    var labels = vis.svg
        .selectAll('.bar-label')
        .data(vis.displayData)

    // enter
    labels
        .enter()
        .append('text')

        // update
        .merge(labels)
        //.transition(t)
        .attr('class', 'bar-label')
        .attr('x', d => vis.x(d[1]) + 5)
        .attr('y', d => vis.y(d[0]) + 3 * vis.y.bandwidth() / 4)
        .attr('font-size', 10)
        .text(d => d[1] + '%');

    // exit
    labels
        .exit()
        .remove()

    // Update the y-axis
    vis.svg.select(".y-axis").call(vis.yAxis);

    // add 100 percent line
    if (d3.max(vis.x.domain()) > 100) {


        vis.line = vis.svg
            .append('line')
            .style("stroke", "black")
            .style("stroke-dasharray", ("3, 3"))
            .attr('x1', vis.x(100))
            .attr('y1', 0)
            .attr('x2', vis.x(100))
            .attr('y2', vis.height)

        vis.svg.append('text')
            .attr('class', 'recvalue-title')
            .attr('x', vis.x(100))
            .attr('font-family', 'Quicksand')
            .attr('text-anchor', 'middle')
            .attr('y', vis.height + vis.margin.bottom / 2)
            .text('Recommended daily value')
    }
}