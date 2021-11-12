(function () {
  let callWithJQuery;
  callWithJQuery = function (pivotModule) {
    if (typeof exports === 'object' && typeof module === 'object') {
      return pivotModule(require('jquery'));
    } else if (typeof define === 'function' && define.amd) {
      return define(['jquery'], pivotModule);
    } else {
      return pivotModule(jQuery);
    }
  };

  callWithJQuery(function ($) {
    let makeGoogleChart;
    makeGoogleChart = function (chartType, extraOptions) {
      return function (pivotData, opts) {
        let agg, base, base1, colKey, colKeys, dataArray, dataTable, defaults, fullAggName, groupByTitle, h, hAxisTitle, headers, i, j, len, len1, numCharsInHAxis, options, ref, result, row, rowKey, rowKeys, title, tree2, vAxisTitle, val, wrapper, x, y;
        defaults = {
          localeStrings: {
            vs: 'vs',
            by: 'by'
          },
          gchart: {}
        }
        opts = $.extend(true, {}, defaults, opts);
        if ((base = opts.gchart).width == null) {
          base.width = window.innerWidth / 1.4;
        };
        if ((base1 = opts.gchart).height == null) {
          base1.height = window.innerHeight / 1.4;
        };
        rowKeys = pivotData.getRowKeys();
        if (rowKeys.length === 0) {
          rowKeys.push([]);
        };
        colKeys = pivotData.getColKeys();
        if (colKeys.length === 0) {
          colKeys.push([]);
        };
        fullAggName = pivotData.aggregatorName;
        if (pivotData.valAttrs.length) {
          fullAggName += '(' + (pivotData.valAttrs.join(', ')) + ')';
        };
        headers = (function () {
          let i, len, results;
          results = [];
          for (i = 0, len = rowKeys.length; i < len; i++) {
            h = rowKeys[i];
            results.push(h.join('-'));
          }
          return results;
        })();
        headers.unshift('');
        numCharsInHAxis = 0;
        if (chartType === 'ScatterChart') {
          dataArray = [];
          ref = pivotData.tree;
          for (y in ref) {
            tree2 = ref[y];
            for (x in tree2) {
              agg = tree2[x];
              dataArray.push([parseFloat(x), parseFloat(y), fullAggName + ': \n' + agg.format(agg.value())]);
            };
          };
          dataTable = new google.visualization.DataTable();
          dataTable.addColumn('number', pivotData.colAttrs.join('-'));
          dataTable.addColumn('number', pivotData.rowAttrs.join('-'));
          dataTable.addColumn({
            type: 'string',
            role: 'tooltip'
          });

          dataTable.addRows(dataArray);
          hAxisTitle = pivotData.colAttrs.join('-');
          vAxisTitle = pivotData.rowAttrs.join('-');
          title = '';
        } else {
          dataArray = [headers];
          for (i = 0, len = colKeys.length; i < len; i++) {
            colKey = colKeys[i];
            row = [colKey.join('-')];
            numCharsInHAxis += row[0].length;
            for (j = 0, len1 = rowKeys.length; j < len1; j++) {
              let rowKey = rowKeys[j];
              agg = pivotData.getAggregator(rowKey, colKey);
              if (agg.value() != null) {
                val = agg.value();
                if ($.isNumeric(val)) {
                  if (val < 1) {
                    row.push(parseFloat(val.toPrecision(3)));
                  } else {
                    row.push(parseFloat(val.toFixed(3)));
                  };
                } else {
                  row.push(val);
                }
              } else {
                row.push(null);
              };
            };
            dataArray.push(row);
          };

          dataTable = google.visualization.arrayToDataTable(dataArray);
          title = vAxisTitle = fullAggName;
          hAxisTitle = pivotData.colAttrs.join('-');
          if (hAxisTitle !== '') {
            title += ' ' + opts.localeStrings.vs + ' ' + hAxisTitle;
          };
          groupByTitle = pivotData.rowAttrs.join('-');
          if (groupByTitle !== '') {
            title += ' ' + opts.localeStrings.by + ' ' + groupByTitle;
          };
        };
        options = {
          title: title,
          hAxis: {
            title: hAxisTitle,
            slantedText: numCharsInHAxis > 50
          },
          vAxis: {
            title: vAxisTitle
          },
          tooltip: {
            textStyle: {
              fontName: 'Arial',
              fontSize: 12
            }
          }
        };
        if (chartType === 'ColumnChart') {
          options.vAxis.minValue = 0;
        };
        if (chartType === 'Bar') {
          options.chart = { title: title },
            options.legend = { position: 'absolute' },
            options.bars = 'horizontal',
            options.vAxis.maxValue = 0
        };
        if (chartType === 'Sankey') {
          let aggregator = pivotData.aggregatorName.toLowerCase();
          dataTable = new google.visualization.DataTable();
          dataTable.addColumn('string', `From`);
          dataTable.addColumn('string', `To`);
          dataTable.addColumn('number', aggregator);
          result = []
          let ii = 0
          let el
          let ps3 = []
          wrapper = []
          for (let rowItem of rowKeys) {
            let graphs = [];
            let i = 0;
            let value = []
            let ps = {}
            let ps2 = {}
            for (let colItem of colKeys) {
              value.push(pivotData.getAggregator(rowItem, colItem).value())
              colItem = colItem.join(',')
              if (rowKeys.length !== 1) graphs[i] = `${rowItem},${colItem}`.split(',')
              else graphs[i] = colItem.split(',')
              i++
            }
            let rowData = [];

            for (let index = 0; index < graphs.length; index++) {
              let item = graphs[index]
              let val = +value[index]
              for (let index = 0; index < item.length; index++) {
                let itemData = item.slice(index, index + 2)
                if (itemData.length == 2) {
                  itemData.push(val)
                  rowData.push(itemData)
                }
              }
            }


            const values = {};
            const separator = '=>';
            rowData.forEach(item => {
              const key = item[0] + separator + item[1];
              if (values[key] === undefined) {
                values[key] = item[2]
                return
              };
              values[key] += item[2];
            });
            rowData = Object.entries(values).map(item => {
              const s = item[0].split(separator);
              return [...s, item[1]];
            });

            dataTable.addRows(rowData)

            rowData = []
            let rowNumber = dataTable.getNumberOfRows()
            let gvjs_Ai = dataTable.__proto__
            ps2 = Object.create(gvjs_Ai)
            ps = Object.assign(ps, dataTable)
            $.extend(true, ps2, ps)
            function createWrapper(ps2, rowNumber) {
              wrapper = new google.visualization.ChartWrapper({
                dataTable: ps2,
                chartType: chartType,
                options: $.extend(options, {
                  title: title,
                  width: 800,
                  height: 400,
                  sankey: {
                    node: { width: 4 },
                    interactivity: true
                  },
                })
              });
              dataTable.removeRows(0, rowNumber)
              return wrapper
            }

            el = document.createElement('div')
            el.id = `sankey_${ii}`
            ww = createWrapper(ps2, rowNumber);
            wrapper[ii] = ww;
            wrapper[ii].draw(el)
            result.push(el)
            ii++
          }
          return result;
        }
        else if (dataArray[0].length === 2 && dataArray[0][1] === '') {
          options.legend = {
            position: 'absolute'
          };
        };
        options = $.extend(true, {}, options, opts.gchart, extraOptions);
        el = document.createElement('div');
        wrapper = new google.visualization.ChartWrapper({
          dataTable: dataTable,
          chartType: chartType,
          options: $.extend(options, {
            width: 800,
            height: 400
          })
        });
        wrapper.draw(el)
        return el;
      }
    }

    return $.pivotUtilities.gchart_renderers = {
      'Line Chart': makeGoogleChart('LineChart'),
      'Bar Chart': makeGoogleChart('ColumnChart'),
      'Horizontal Bar Chart': makeGoogleChart('Bar'),
      'Stacked Bar Chart': makeGoogleChart('ColumnChart', {
        isStacked: true
      }),
      'Sankey Chart': makeGoogleChart('Sankey'),
      'Area Chart': makeGoogleChart('AreaChart', {
        isStacked: true
      })
    };
  });

}).call(this);
