/* *******************************************************************************
* Created by  Zhiwei YAN on 2021/4/26.
* Copyright © 2021  Zhiwei YAN. All rights reserved.
* ***************************************************************************** */

/* *******************************************************************************
* The first part includes these functions, especially to draw the graphic elements.
* They invoke the third library named svg.js, to draw lines, arrows and rectangles.
* The specification of the graphic elements are saved in the HTML table, including
* canvas positions, graphic types such as line, rectangle, arrow. The text is also
* considered as a special graphic element.
*
* It is also noticed that some attributes of graphic elements are NOT in this HTML
* table, but in another CSS file, such as color, line width, font size and so on.
*
* We will divide a svg graphic figure into three parts: fixed texts, varying texts,
* and other basic geometry elements. In fact, we will initialize these fixed texts
* and the varying texts with the same function. And the value of varying texts can
* be updated by an MQTT client function according to its svg id.
* ***************************************************************************** */

/* *******************************************************************************
* The three functions are only used to export and to be invoked from outside.
* ***************************************************************************** */
function drawProcedureTitleText(canvas, html_table_id) {
    add_svg_texts(canvas, html_table_id);
}

function drawProcedureSampleValue(canvas, html_table_id) {
    add_svg_texts(canvas, html_table_id);
}

function drawProcedureRelationship(canvas, html_table_id) {
    add_svg_geometry_elements(canvas, html_table_id);
}

function add_svg_texts(canvas, table_id) {
    // let canvas = SVG().addTo("#svg_canvas").size(1600, 1200);
    let table = document.getElementById(table_id);

    //skip the first row 0
    for (let i = 1, row; row = table.rows[i]; i++) {

        //iterate through rows
        //rows would be accessed using the "row"
        let [id, title, layout_x, layout_y, css] = [0, "NA", 0, 0, "CSS"];

        for (let j = 0, col; col = row.cells[j]; j++) {

            //iterate through columns
            //columns would be accessed using the "col"
            //read the attributes of a procedure
            switch (j) {
                case 0:
                    id = col.innerText;
                    break;
                case 1:
                    title = col.innerText;
                    break;
                case 2:
                    [layout_x, layout_y] = col.innerText.split(",");
                    break;
                case 3:
                    css = col.innerText;
                    break;
                default:
                    break;
            }
        }
        // console.log(id, title, layout_x, layout_y, css)
        // draw the procedure with the attributes
        // with the div of svg format.
        svg_add_procedure_element(canvas, id, title, layout_x, layout_y, css);
    }
}

function svg_add_procedure_element(canvas,
                                   id, title, x, y, css_class) {
    //define a svg symbol;
    //let svg_symbol = canvas.symbol();
    canvas.text(title)
        .attr('id', id)
        .attr('class', css_class)
        .font({stretch: "condensed", anchor: "start"})
        .move(x, y)
        .on('click', function (e) {
            if (this.text() == id) {
                this.text(title);
            } else {
                this.text(id);
            }
            this.scale(2)
            this.scale(1/2);
        });
    //move the svg symbol into the pre-defined position;
    //canvas.use(svg_symbol).move(x,y);
}

function add_svg_geometry_elements(canvas, html_table_id) {
    let table = document.getElementById(html_table_id);

    //skip the first row 0
    for (let i = 1, row; row = table.rows[i]; i++) {

        //iterate through rows
        //rows would be accessed using the "row" variable
        let [id, type, x1, x2, x3, x4, css] = [0, "NA", 0, 0, 0, 0, "CSS"];

        for (let j = 0, col; col = row.cells[j]; j++) {

            //iterate through columns
            //columns would be accessed using the "col"
            //read the attributes of a procedure
            switch (j) {
                case 0:
                    id = col.innerText;
                    break;
                case 1:
                    type = col.innerText;
                    break;
                case 2:
                    [x1, x2, x3, x4] = col.innerText.split(",");
                    break;
                case 3:
                    css = col.innerText;
                    break;
                default:
                    break;
            }
        }
        // console.log(id, type, x1, x2, x3, x4, css);
        // draw the procedure with the attributes
        // with the div of svg format.

        switch (type) {
            case "line":
                svg_add_relation_line(canvas, id, x1, x2, x3, x4, css);
                break;
            case "arrow":
                svg_add_relation_arrow(canvas, id, x1, x2, x3, css);
                break;
            case "rect":
                svg_add_relation_rect(canvas, id, x1, x2, x3, x4, css);
                break;
            default:
                break;
        }
    }
}

function svg_add_relation_line(canvas, id, x1, y1, x2, y2, css_class) {
    canvas.line(x1, y1, x2, y2)
        .attr('id', id)
        .attr('class', css_class);
}

function svg_add_relation_rect(canvas, id, x, y, width, height, css_class) {
    canvas.rect(width, height)
        .attr('id', id)
        .attr('class', css_class)
        .move(x, y);
}

function svg_add_relation_arrow(canvas, id, x, y, direction, css_class) {

    let [x1, y1, x2, y2] = [0, 0, 0, 0];
    let arrow_marker = canvas.marker(10, 10, function (add) {
        add.path("M 0 0 L 10 5 L 0 10 z")
    });
    switch (direction) {
        case "right":
            [x1, y1, x2, y2] = [0, 0, 20, 0];
            break;
        case "left":
            [x1, y1, x2, y2] = [20, 0, 0, 0];
            break;
        case "up":
            [x1, y1, x2, y2] = [0, 20, 0, 0];
            break;
        case "down":
            [x1, y1, x2, y2] = [0, 0, 0, 20];
            break;
        default:
            break;
    }

    canvas.line(x1, y1, x2, y2)
        .attr('id', id)
        .attr('class', css_class)
        .marker('end', arrow_marker)
        .move(x, y);
}

/* *****************************************************************************
 * The function deals with the I/O of web pages with remote servers. Up to now, it
 * is an unique channel to communicate with other remote MQTT peers. Here, We hide
 * the values of the MQTT server and port by means of the web-assembly technique.
 *
 * We define the callback functions to deal with the MQTT events, such as the lost
 * of connections, arrivals of messages, and so on.
 * ************************************************************************** */

/*
 * FUNCTION NAME: StartMqttClient()
 * INPUT: the host/ip of the mqtt server.
 *        the port of the mqtt server.
 * DESCRIPTION:
 *  Assign the mqtt client id with a random number, and create a connection with
 *  the specified server host/ip and port. Register the events of the connections,
 *  with corresponding functions, especially to subscribe a TOPIC when it connects
 *  the server successfully.
 */
function startMqttClient(host, port) {

    let client_id = (parseInt(Math.random() * 100) % 100).toString();

    let mqtt_recv_client = new Paho.MQTT.Client(host, port, client_id);
    mqtt_recv_client.onMessageArrived = on_message_arrived;
    mqtt_recv_client.onConnectionLost = on_connection_lost;
    mqtt_recv_client.connect({onSuccess: on_connection});

    function on_connection() {
        console.log("mqtt connected, subscribe, success.");
        mqtt_recv_client.subscribe("iot");
    }

    function on_message_arrived(msg) {
        // console.log("recv: " + msg.payloadString);
        let parsed_msg = JSON.parse(msg.payloadString);
        k = parseInt(parsed_msg.id) % 7;
        id = 'v_PROCWATERINCOMING';
        switch (k) {
            case 0:
                id = 's_PROCWATERINCOMING';
                break;
            case 1:
                id = 's_WETDEDUSTING';
                break;
            case 2:
                id = 's_DFLOWWATERSUPP';
                break;
            case 3:
                id = 's_DEFROGWATERVOL';
                break;
            case 4:
                id = 'c_WASTEWATERVOL';
                break;
            case 5:
                id = 'm_EVAPORATIONLOSS';
                break;
            case 6:
                id = 'm_GYPSUMABSORBING';
                break;
            default:
                break;
        }
        // update values of variables in the figure.
        let figure_svg_node = canvas.find('text#' + id);
        figure_svg_node.text(parsed_msg.data);

        // update the values in the table.
        view_model.UpdateValues(id, parsed_msg.data);

        // update the values in the charts of Echarts.
        updateChartData(id, parsed_msg.data);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function on_connection_lost(res) {
        console.log("mqtt connecting, failed." + res.errorMessage);
        sleep(3000);
        mqtt_recv_client.connect({onSuccess: on_connection});
    }
}

/* ***************************************************
 * The functions are designed to handle web tables, which are also followed by the
 * MVC and MVVM patterns. The MVVM is another programming architecture which saves
 * some parts of data model in the JavaScript Runtime at the same time other parts
 * of data model are stored inside HTML <table> tags.
 * *************************************************** */

/*
 * FUNCTION NAME: drawWebTable()
 * INPUT: the id of html <table> for model,
 *        the id of html <div> for view
 * OUTPUT:
 *        the table in the html <table>.
 * DESCRIPTION:
 * Read the data model from the table of html, parse every row and its attributes
 * of table, draw the table with these attributes. It is also seen that ViewModel
 * are labeled in the some cells of the table by KnockOut.js.
 */
function drawWebTable(model_id, view_id) {
    let tb_model = document.getElementById(model_id);
    let tb_view = document.getElementById(view_id).getElementsByTagName('tbody')[0];

    for (let i = 1, row; row = tb_model.rows[i]; i++) {
        let [id, title, data_bind, css] = ['NA', 'NA', 'text', 'CSS'];
        for (let j = 0, col; col = row.cells[j]; j++) {

            //iterate through columns
            //columns would be accessed using the "col"
            //read the attributes of a procedure
            switch (j) {
                case 0:
                    id = col.innerText;
                    break;
                case 1:
                    title = col.innerText;
                    break;
                case 2:
                    data_bind = col.innerText.split(",");
                    break;
                case 3:
                    css = col.innerText;
                    break;
                default:
                    break;
            }
        }
        let tb_row = tb_view.insertRow(-1);
        tb_row.id = id + '_tr'; // add attribute "id" in tag <tr>,

        //tb_row.onclick = interactSvgWebTable(canvas, tb_row.id)
        // tb_row.onclick = function () {
        //     document.getElementById(tb_row.id).innerHTML = 111
        //     document.getElementById(tb_row.id).innerHTML = 111
        //     //alert("Test on click.")
        // }

        tb_row.onclick = function () {
            // let table_text_id = tb_row.id.match(/(\S*)_tr/)[1];
            // console.log(table_text_id);
            let svg_data_text = canvas.find("text#" + id);
            console.log(svg_data_text);
            svg_data_text.animate()
                .transform({scale: 2});
            console.log("End.")
        }


        let tb_cell_title = tb_row.insertCell(0);
        tb_cell_title.innerHTML = title;
        tb_cell_title.className = css;

        let tb_cell_value = tb_row.insertCell(1);
        tb_cell_value.innerHTML = '<span class="'
            + css + '"'
            + ' '
            + 'data-bind="'
            + data_bind
            + ':'
            + id
            + '"></span>';
    }
}

function interactSvgWebTable(canvas, web_tr_id) {
    let table_text_id = web_tr_id.match(/(\S*)_tr/)[1];
    let svg_data_text = canvas.find("text#" + table_text_id);
    svg_data_text.animate()
        .transform({rotate: 180, scale: 2})
        .animate()
        .transform({rotate: 180, scale: 1/2})
}

/*
 * FUNCTION NAME: DesulParaTbViewmodel()
 * INPUT: none.
 * OUTPUT: none.
 * DESCRIPTION:
 * It is the view-model of MVVM which is defined by javascript. The pureComputed
 * variable is calculated by other four variables. UpdateValues() will be called
 * by the MQTT client to refresh the newest values. The data are just binding to
 * the corresponding cells of Table of html web pages.
 */
function DesulfParaTbViewmodel() {
    var self = this;
    self.s_PROCWATERINCOMING = ko.observable(0.0);
    self.m_GYPSUMABSORBING = ko.observable(0.0);
    self.m_EVAPORATIONLOSS = ko.observable(0.0);
    self.c_WASTEWATERVOL = ko.observable(0.0);

    self.c_LEAKWATER = ko.pureComputed(function () {
        return -parseFloat(self.c_WASTEWATERVOL())
            - parseFloat(self.m_EVAPORATIONLOSS())
            - parseFloat(self.m_GYPSUMABSORBING())
            + parseFloat(self.s_PROCWATERINCOMING());
    }, this);

    self.UpdateValues = function (id, v) {
        // console.log(id, v);
        switch (id) {
            case 's_PROCWATERINCOMING':
                self.s_PROCWATERINCOMING(v);
                break;
            case 'c_WASTEWATERVOL':
                self.c_WASTEWATERVOL(v);
                break;
            case 'm_GYPSUMABSORBING':
                self.m_GYPSUMABSORBING(v);
                break;
            case 'm_EVAPORATIONLOSS':
                self.m_EVAPORATIONLOSS(v);
                break;
            default:
                break;
        }
    };
}


/* ***************************************************
 * The following functions are used to read the model of the charts, draw them via
 * Apache echarts library, and re-draw or update the curves when the MQTT messages
 * arrive.
 * *************************************************** */

/* Three global variables for charts via Apache Echarts.  */
let chart_data_buff = [];            //multiple curves will be stored in it.
let chart_data_buff_size = 17;       //the number of data points for a curve.
let time_axis = [];                  //corresponding X/timestamp axis.

/*
 * FUNCTION NAME: initCharts()
 * INPUT: the model id of html <table>,
 *        the view id of html <div>.
 * OUTPUT: the content of table of html pages.
 * DESCRIPTION:
 * Read data model stored in the tags <table> of the web page, and parse every row
 * of the table, place the canvas into the position specified by the <div> tags in
 * the html page. It is noticed which  the variable called 'data' is used to store
 * values of Y-axis of each curve while the X-axis is consisted of the timestamps.
 */
function initCharts(model_id, view_id) {
    let chart_model = document.getElementById(model_id);
    for (let i = 1, row; row = chart_model.rows[i]; i++) {
        let [id, title, type, memo] = ['NA', 'NA', 'line', 'MEMO'];
        for (let j = 0, col; col = row.cells[j]; j++) {
            switch (j) {
                case 0:
                    id = col.innerText;
                    break;
                case 1:
                    title = col.innerText;
                    break;
                case 2:
                    type = col.innerText;
                    break;
                case 3:
                    memo = col.innerText;
                    break;
                default:
                    break;
            }
        }
        // console.log(id, title, type, memo);
        let data = [];
        for (let i = 0; i < chart_data_buff_size; i++) {
            data.push(0);
        }
        let t = {
            'id': id,
            'title': title,
            'type': type,
            'memo': memo,
            'data': data
        };
        chart_data_buff.push(t);
    }
    for (let i = 0; i < chart_data_buff_size; i++) {
        time_axis.push(null);
    }
    drawCharts(view_id, chart_data_buff);
}


/*
 * Function Name: drawCharts()
 * Input: the view id of html <div>,
 *        the drawing attributes or data of every chart.
 * Description:
 * Read the attributes of every chart, and assign a color (RED/BLUE/GREEN) to each
 * chart, assign other features of drawings inside the Echarts Canvas, such as the
 * title of canvas, legend and so on. Then the timer of updating is set to refresh
 * the elements on the canvas every the fixed time interval such as 800 ms.
 */
function drawCharts(view_id, chart_buff) {
    var e_chart = echarts.init(
        document.getElementById(view_id),
        null,
        {
            renderer: 'svg',
            useDirtyRect: true
        }
    );

    // setup the attributes of each chart
    let series_chart = [];
    let legend_data = [];
    for (let x of chart_buff) {
        let c = '#000000';
        switch (x.memo) {
            case 'sensor_data':
                c = '#0000FF';
                break;
            case 'manual_data':
                c = '#FF0000';
                break;
            case 'calculated_data':
                c = '#00ff00';
                break;
            default:
                c = '#000000';
                break;
        }
        let chart = {
            name: x.title,
            type: x.type,
            data: x.data,
            color: c,
            label: {
                show: false,
                formatter: x.title,
            }
        };
        series_chart.push(chart);
        legend_data.push(x.title);
    }

    // specify chart configuration item and data
    let option = {
        toolbox: {
            show: true,
            feature: {
                saveAsImage: {}
            }
        },
        animation: false,
        legend: {
            bottom: 10,
            data: legend_data
        },
        title: {
            text: '工艺关键参数近期趋势',
            left: "center"
        },
        tooltip: {},
        xAxis: {type: 'category', data: time_axis},
        yAxis: {max: 500, min: -100},
        series: series_chart
    };

    e_chart.setOption(option);

    setInterval(function () {
        e_chart.setOption({
            xAxis: {type: 'category', data: time_axis},
            series: series_chart
        });
    }, 1000);
}

/*
 * FUNCTION NAME: updateChartData()
 * INPUT: id of the variable to be shown,
 *        value of the variable from a remote MQTT server.
 * OUTPUT: None.
 * DESCRIPTION:
 * Get the current timestamp, update the corresponding timestamp axis, and update
 * the newest value of array with the variable id. It is noticed the data array is
 * FIFO data structure.
 */
function updateChartData(id, v) {
    let t_now = moment().format('HH:mm:ss');

    time_axis.push(t_now);
    time_axis.shift();

    for (let x of chart_data_buff) {
        // console.log(x.id, id);
        if (x.id == id) {
            x.data.push(v);
            x.data.shift();
        } else {
            x.data.push(x.data[x.data.length - 1]);
            x.data.shift();
        }
    }
}