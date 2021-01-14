// When the browser window is resized, responsify() is called.
d3.select(window).on('resize', makeResponsive);

// When the browser loads, makeResponsive() is called.
makeResponsive();

// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {
  var svgArea = d3.select('body').select('svg');
  if (!svgArea.empty()) {
      svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width and height of the browser window.
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // function used for updating x-scale var upon click on axis label
  function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
        d3.max(stateData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

      return xLinearScale;

  }

  function yScale(stateData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
        d3.max(stateData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0])

      return yLinearScale;

  }
  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating yAxis var upon click on y axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }

// function used for updating abbr group with a transition to
  // new circles
  function renderAbbr(abbrGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    abbrGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]));

    return abbrGroup;
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

      var label1;
      var label2;

      if (chosenXAxis === "poverty") {
        label1 = "Poverty (%): ";
      }
      else if (chosenXAxis === "age") {
        label1 = "Age (Median): ";
      }
      else {
          label1 = "Income (Median): ";
      }

      if (chosenYAxis === "obescity") {
        label2 = "Obesity (%): ";
      }
      else if (chosenYAxis === "smokes") {
        label2 = "Smokes (%): ";
      }
      else {
          label2 = "Healthcare (%): ";
      }

      var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, 0])
      .html(function(d) {
        return (`<strong> ${d.state} </strong> <br>${label1} ${d[chosenXAxis]} <br> ${label2} ${d[chosenYAxis]} `);
      });

      circlesGroup.call(toolTip);
      
      circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data, this);
        });

      return circlesGroup;

  }

  // Retrieve data from the CSV file and execute everything below
  d3.csv("data/data.csv").then(function(stateData, err) {
    if (err) throw err;

    // parse data
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
      data.abbr = data.abbr;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll(".stateCircle")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 18)
      .classed("stateCircle", true)
      .attr("opacity", ".5");
      

    var abbrGroup = chartGroup.selectAll(".stateText")
      .data(stateData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("dy", 3)
      .attr("font-size", 10)
      .text(d => d.abbr);
      
    
    // Create group for three x-axis labels
    var labelsXGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsXGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("x-axis active", true)
      .text("In Poverty (%)");

    var ageLabel = labelsXGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("x-axis inactive", true)
      .text("Age (Median)");

    var incomeLabel = labelsXGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("x-axis inactive", true)
      .text("Household Income (Median)");

     // Create group for three y-axis labels
    var labelsYGroup = chartGroup
      .append("g")
      .attr("transform", "rotate(-90)");

    var obescityLabel = labelsYGroup.append("text")
      .attr("y", 0 - (margin.left))
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "obesity") // value to grab for event listener
      .classed("y-axis inactive", true)
      .text("Obesse (%)");

    var smokesLabel = labelsYGroup.append("text")
      .attr("y", 0 - (margin.left-20))
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "smokes") // value to grab for event listener
      .classed("y-axis inactive", true)
      .text("Smokes (%)");

    var healthcareLabel = labelsYGroup.append("text")
      .attr("y", 0 - (margin.left-40))
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("y-axis active", true)
      .text("Lacks Healthcare (%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
    // x axis labels event listener
    labelsXGroup.selectAll(".x-axis")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(stateData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates abbr group with new x values
          abbrGroup = renderAbbr(abbrGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }

          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }

          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }

                   
          textAnalysis(chosenXAxis);

          function textAnalysis(axisValue)  {
            var text = parent.document.getElementById('analysis');

            console.log(axisValue);

          
            var responses = ["<h3> <strong> Correlations Discovered: POVERTY (%) vs Each of Three Health Risk Issues By Geography: </strong> </h3> <br> There is a clear positive correlation (close to 1.0 intuitively) between poverty and Obesity, Smokes and Lack of Healthcare. ",
                            "<h3> <strong> Correlations Discovered: AGE (Median) vs Each of Three Health Risk Issues By Geography: </strong> </h3> <br> There is a unclear sign correlation (close to zero) between age Obesity, Smokes and Lack of Healthcare. ",
                            "<h3> <strong> Correlations Discovered: HOUSEHOLD INCOME (Median) vs Three Health Risk Issues By Geography: </strong> </h3> <br> There is a clear negative correlation (close to -1.0) between household income and Obesity, Smokes and Lack of Healthcare. ",
                            ];
          
            var answer;
          
            if (axisValue === "poverty") {
                  answer = responses[0];
              }
            else if (axisValue === "age")  {
                answer = responses[1];
              }
            else {
                answer = responses[2];
              }

            text.innerHTML = answer;

          };

         }
      });

    // y axis labels event listener
    labelsYGroup.selectAll(".y-axis")
      .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
      chosenYAxis = value;

      // console.log(chosenYAxis)

      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(stateData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new y values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates abbr group with new y values
      abbrGroup = renderAbbr(abbrGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text

      if (chosenYAxis === "obesity") {
        obescityLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }

      else if (chosenYAxis === "smokes") {
        obescityLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }

      else {
        obescityLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
    });


    
  }).catch(function(error) {
    console.log(error);
  });


};

