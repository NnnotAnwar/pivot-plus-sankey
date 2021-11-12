(function () {
  let callWithJQuery;

  callWithJQuery = function (pivotModule) {
    if (typeof exports === "object" && typeof module === "object") {
      return pivotModule(require("jquery"), require("plotly.js"));
    } else if (typeof define === "function" && define.amd) {
      return define(["jquery", "plotly.js"], pivotModule);
    } else {
      return pivotModule(jQuery, Plotly);
    }
  };
  callWithJQuery(function ($, Plotly) {
    let makePlotlyChart, makePlotlySankeyChart;
    makePlotlyChart = function (traceOptions, layoutOptions, transpose) {
      if (traceOptions == null) {
        traceOptions = {};
      }
      if (layoutOptions == null) {
        layoutOptions = {};
      }
      if (transpose == null) {
        transpose = false;
      }
      return function (pivotData, opts) {
        let colKeys, columns, d, data, datumKeys, defaults, fullAggName, groupByTitle, hAxisTitle, i, layout, result, rowKeys, rows, titleText, traceKeys;
        defaults = {
          localeStrings: {
            vs: "с",
            by: "на"
          },
          plotly: {},
          plotlyConfig: {
            toImageButtonOptions: {
              format: 'png', // one of png, svg, jpeg, webp
              filename: 'Диаграмма',
              scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
            },
            locale: 'ru',
            displaylogo: false,
            doubleClickDelay: 700
          }
        };
        opts = $.extend(true, {}, defaults, opts);
        rowKeys = pivotData.getRowKeys();
        colKeys = pivotData.getColKeys();
        traceKeys = transpose ? colKeys : rowKeys;
        if (traceKeys.length === 0) {
          traceKeys.push([]);
        }
        datumKeys = transpose ? rowKeys : colKeys;
        if (datumKeys.length === 0) {
          datumKeys.push([]);
        }
        fullAggName = pivotData.aggregatorName;
        if (pivotData.valAttrs.length) {
          fullAggName += "(" + (pivotData.valAttrs.join(", ")) + ")";
        }
        data = traceKeys.map(function (traceKey) {
          let datumKey, j, labels, len, trace, val, values;
          values = [];
          labels = [];
          for (j = 0, len = datumKeys.length; j < len; j++) {
            datumKey = datumKeys[j];
            val = parseFloat(pivotData.getAggregator(transpose ? datumKey : traceKey, transpose ? traceKey : datumKey).value());
            values.push(isFinite(val) ? val : null);
            labels.push(datumKey.join('-') || ' ');
          }
          trace = {
            name: traceKey.join('-') || fullAggName
          };
          if (traceOptions.type === "pie") {
            trace.values = values;
            trace.labels = labels.length > 1 ? labels : [fullAggName];
          } else {
            trace.x = transpose ? values : labels;
            trace.y = transpose ? labels : values;
          }
          return $.extend(trace, traceOptions);
        });
        if (transpose) {
          hAxisTitle = pivotData.rowAttrs.join("-");
          groupByTitle = pivotData.colAttrs.join("-");
        } else {
          hAxisTitle = pivotData.colAttrs.join("-");
          groupByTitle = pivotData.rowAttrs.join("-");
        }
        titleText = fullAggName;
        if (hAxisTitle !== "") {
          titleText += " " + opts.localeStrings.vs + " " + hAxisTitle;
        }
        if (groupByTitle !== "") {
          titleText += " " + opts.localeStrings.by + " " + groupByTitle;
        }
        layout = {
          title: titleText,
          hovermode: 'closest',
          width: window.innerWidth / 1.4,
          height: window.innerHeight / 1.2 - 50,
        };
        if (traceOptions.type === 'pie') {
          columns = Math.ceil(Math.sqrt(data.length));
          rows = Math.ceil(data.length / columns);
          layout.grid = {
            columns: columns,
            rows: rows
          };
          for (i in data) {
            d = data[i];
            d.domain = {
              row: Math.floor(i / columns),
              column: i - columns * Math.floor(i / columns)
            };
            if (data.length > 1) {
              d.title = d.name;
            }
          }
          if (data[0].labels.length === 1) {
            layout.showlegend = false;
          }
        } else {
          layout.xaxis = {
            title: transpose ? fullAggName : null,
            automargin: true
          };
          layout.yaxis = {
            title: transpose ? null : fullAggName,
            automargin: true
          };
        }

        result = $("<div>").appendTo($("body"));
        Plotly.newPlot(result[0], data, $.extend(layout, layoutOptions, opts.plotly), opts.plotlyConfig);
        return result.detach();
      };
    };
    makePlotlySankeyChart = function () {
      return function (pivotData, opts) {
        let colKey, colKeys, data, defaults, j, k, layout, len, len1, renderArea, result, rowKey, rowKeys, v, label, value, sankey, sources, targets;
        defaults = {
          localeStrings: {
            vs: "на",
            by: "с"
          },
          plotly: {},
          plotlyConfig: {
            toImageButtonOptions: {
              format: 'png', // one of png, svg, jpeg, webp
              filename: 'Диаграмма_Санкей',
              scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
            },
            modeBarButtonsToRemove: ['lasso', 'select'],
            locale: 'ru',
            displaylogo: false
          }
        };
        opts = $.extend(true, {}, defaults, opts);
        rowKeys = pivotData.getRowKeys();
        if (rowKeys.length === 0) {
          rowKeys.push([]);
        }
        colKeys = pivotData.getColKeys();
        if (colKeys.length === 0) {
          colKeys.push([]);
        }
        data = [];
        label = [];
        sources = [];
        targets = [];
        for (let i = 0; i < rowKeys.length; i++) {
          rowKey = rowKeys[i];
          let y_start = 1 / rowKeys.length * i;
          let y_end = 1 / rowKeys.length * (i + 1);
          let y_gap = 1 / rowKeys.length / 10;
          let labelItem = [];
          let labelArray = [];
          let labelKeys = {};
          value = [];
          for (let j = 0; j < colKeys.length; j++) {
            label.push(rowKey);
            colKey = colKeys[j];
            labelItem = [];
            if (rowKey.length > 0) { labelItem.push(String(rowKey)) }
            for (let colItem of colKey) {
              labelItem.push(colItem);
              label.push(colItem);
            }
            labelArray.push(labelItem);
            value.push(pivotData.getAggregator(rowKey, colKey).value());
          }
          labelItem = [];
          for (let index = 0; index < labelArray.length; index++) {
            let item = labelArray[index];
            let val = value[index];
            for (let index = 0; index < item.length; index++) {
              let itemData = item.slice(index, index + 2);
              if (itemData.length == 2) {
                itemData.push(val);
                labelItem.push(itemData);
              }
            }
          }
          const values = {};
          const separator = '=>';
          labelItem.forEach(item => {
            const key = item[0] + separator + item[1];
            if (values[key] === undefined) {
              values[key] = item[2];
              return;
            };
            values[key] += item[2];
          });
          labelItem = Object.entries(values).map(item => {
            const s = item[0].split(separator);
            return [...s, item[1]];
          });
          value = [];
          for (let item of labelItem) {
            value.push(item[2]);
          }
          for (let item of label) {
            String(item);
            labelKeys[`${item}`] = true;
          }
          let rowData = Object.keys(labelKeys);
          for (let item of labelItem) {
            item = item.slice(0, 2);
            sources.push(rowData.indexOf(item[0]));
            targets.push(rowData.indexOf(item[1]));
          }
          sankey = {
            orientation: "h",
            node: {
              pad: 15,
              thickness: 30,
              line: {
                color: "black",
                width: 0.5
              },
              label: rowData, // элементы (Male, Conservative, Quentin, 20)
            },
            link: {
              source: sources, // фром(индекс элемента)
              target: targets, // ту(индекс элемента)
              value: value   // валью(значение аггрегатора)
            },
            domain: {
              x: [0, 1], // ширина одного элемента от 0 до 100 процентов(0.00-1.00)
              y: [y_start, y_end - y_gap] // высота занимаемого 
            },
            xaxis: `x${i}`,
            yaxis: `y${i}`,

            type: 'sankey',
          }
          data.push(sankey);
          label = [];
        }
        layout = {
          title: pivotData.aggregatorName + ' на ' + pivotData.rowAttrs.join("-") + ' с ' + pivotData.colAttrs.join("-"),
          hovermode: 'closest',
          width: window.innerWidth / 1.3,
          height: rowKeys.length * 500 - (rowKeys.length - 1 * 150),
        };
        renderArea = $("<div>", {
          style: "display:none;"
        }).appendTo($("body"));
        result = $("<div>").appendTo(renderArea);
        Plotly.newPlot(result[0], data, $.extend(layout, opts.plotly), opts.plotlyConfig);
        result.detach();
        renderArea.remove();
        return result;
      };
    };
    return $.pivotUtilities.plotly_renderers = {
      "Гистограмма": makePlotlyChart({
        type: 'bar'
      }, {
        barmode: 'group'
      }),
      "Группированная гистограмма": makePlotlyChart({
        type: 'bar'
      }, {
        barmode: 'relative'
      }),
      "Горизонтальная гистограмма": makePlotlyChart({
        type: 'bar',
        orientation: 'h',
      }, {
        barmode: 'group',
      }, true),
      "Группированная горизонтальная гистограмма": makePlotlyChart({
        type: 'bar',
        orientation: 'h'
      }, {
        barmode: 'relative'
      }, true),
      "Линейная диаграмма": makePlotlyChart(),
      "Диаграмма с областями": makePlotlyChart({
        stackgroup: 1
      }),

      "Диаграмма Санкей": makePlotlySankeyChart(),
      'Множественная круговая диаграмма': makePlotlyChart({
        type: 'pie',
        scalegroup: 1,
        hoverinfo: 'label+value',
        textinfo: 'none'
      }, {}, true)
    };
  });

}).call(this);