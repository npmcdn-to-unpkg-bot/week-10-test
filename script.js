var color = d3.scale.category20c();

var margin = 10,
    diameter = 960;
    
var pack = d3.layout.pack()
    .padding(3)
    .size([diameter - margin, diameter - margin])
    .value(function(d) { return d.size; });   

var svg = d3.select("body").append("svg")
    .attr("width", diameter + 100)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");  

 
// set the default to imports
var dir = 'imports.json';


    d3.select('#direction').on('change', function () {
        dir = d3.event.target.value;
        Chart(dir);            
    }); 


// define the main function  
function Chart (dir) {

    var chart = this;     
    chart.direction = dir;

    svg.selectAll("text").remove();

//        console.log('function start', chart.direction);

    d3.json(chart.direction, function(error, root) {
        if (error) throw error;        

        var focus = root,
        nodes = pack.nodes(root),
        view;       


        var circle = svg.selectAll('#chart')
        .data(nodes)
        .enter().append("circle")
        .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
        .style("fill", function(d) { return d.children ? color(d.depth) : null; })
        .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

        var text = svg.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
        .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
        .text(function(d) { return d.name; });  
    
        chart.tooltip = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);    
    
        d3.selectAll('.node')
            .on('mouseover', function(d) {
                chart.tooltip.transition()
                .duration(50)
                .style('opacity', 1)
                .style("left", (d3.event.pageX + 30) + "px")     
                .style("top", (d3.event.pageY - 30) + "px");
        
                chart.tooltip.append('p')
                .attr('class', 'tooltip_text')
                .html(function() {
                if (d['cname']) {
                    return d['cname'] + ', ' + convert(d['value']);
                    } else {
                    return d['name'] + ', ' + convert(d['value']);
                    }        
                })
            })
            .on("mouseout", function(d) {       
                chart.tooltip.html('')
                .transition()        
                .duration(50)      
                .style("opacity", 0)
        });    
    
    
        var node = svg.selectAll("circle,text");

        d3.select("body")
//      .style("background", color(-1))
        .on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
            var focus0 = focus; focus = d;
            var transition = d3.transition()
            .duration(d3.event.altKey ? 75 : 2) // last number is transition speed
            .tween("zoom", function(d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function(t) { zoomTo(i(t)); };
            });

            transition.selectAll("text")
                .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
                .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
            }

        function zoomTo(v) {
//      console.log('zoom to');
            var k = diameter / v[2]; view = v;
            node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function(d) { return d.r * k; });
        }

        d3.select(self.frameElement).style("height", diameter + "px");    
    
    });      
    
}     
        
function convert(num) {
    if (num > 1000000) {
        convert.output = num/1000000;
        convert.output = convert.output.toFixed(1);
        convert.output += ' trillion';        
    } else if (num > 1000) {
        convert.output = num/1000;      
        convert.output = convert.output.toFixed(1);            
        convert.output += ' billion';        
    } else {
        convert.output = num + ' million';
    }       
    return '$' + convert.output;
}


 Chart(dir);    
