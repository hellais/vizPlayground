'use strict';

var dataTransferBarChart = dc.barChart('#data-transfer-bar-chart');
var dataTransferAreaChart = dc.lineChart('#data-transfer-area-chart');

var prettyBytes = function(bytes) {
  var fmt = d3.format('.1f');
  if (bytes < 1024) {
    return fmt(bytes) + 'B';
  } else if (bytes < 1024 * 1024) {
    return fmt(bytes / 1024) + 'kB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return fmt(bytes / 1024 / 1024) + 'MB';
  } else {
    return fmt(bytes / 1024 / 1024 / 1024) + 'GB';
  }
}

d3.csv('data.csv', function (data) {
    var tip = d3.tip()
      .offset([-10, 0])
      .attr('class', 'd3-tip')
      .html(function(d) {
        return prettyBytes(d.data.value * 1024);
    })
    var dateFormat = d3.time.format('%Y-%m-%d');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
        d.dd = dateFormat.parse(d.date);
        d.data_transferred = +d.data_transferred;
    });
    var startDate = d3.min(data.map(function(d) { return d.dd; }));
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var dailyDimension = ndx.dimension(function (d) {
        return d.dd;
    });
    var dateDimension = ndx.dimension(function (d) {
        return d.dd;
    });
    var dataTransferGroup = dateDimension.group().reduceSum(function (d) {
      return d.data_transferred;
    });

    dataTransferBarChart 
        .width(990)
        .height(200)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 80})
        .dimension(dateDimension)
        .group(dataTransferGroup, 'Data trasnfer')
        .mouseZoomable(true)
        .rangeChart(dataTransferAreaChart)
        .x(d3.time.scale().domain([startDate, new Date()]))
        .round(d3.time.day.round)
        .xUnits(d3.time.days)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)
        .renderLabel(true)
        .label(function (d) {
            var bytes = d.value * 1024.0;
            return dateFormat(d.key) + '\n' + prettyBytes(bytes);
        })
        .yAxis().tickFormat(function(bytes) {
            bytes = bytes * 1024.0;
            return prettyBytes(bytes);
        });
   
    dataTransferBarChart.on("postRender", function(chart) {
      chart.svg().call(tip);
      chart.selectAll(".bar")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
      chart.focus([new Date(2014, 6, 1), new Date()]);
    });

    dataTransferAreaChart.width(990)
        .renderArea(true)
        .height(40)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(dateDimension)
        .group(dataTransferGroup, 'Data trasnfer')
        .x(d3.time.scale().domain([startDate, new Date()]))
        .round(d3.time.day.round)
        //.yAxis()
        .xUnits(d3.time.days);

    dc.renderAll();

});
