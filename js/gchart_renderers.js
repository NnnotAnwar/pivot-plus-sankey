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
        }
        if ((base1 = opts.gchart).height == null) {
          base1.height = window.innerHeight / 1.4;
        }
        rowKeys = pivotData.getRowKeys();
        if (rowKeys.length === 0) {
          rowKeys.push([]);
        }
        colKeys = pivotData.getColKeys();
        if (colKeys.length === 0) {
          colKeys.push([]);
        }
        fullAggName = pivotData.aggregatorName;
        if (pivotData.valAttrs.length) {
          fullAggName += '(' + (pivotData.valAttrs.join(', ')) + ')';
        }
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
            }
          }
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
              rowKey = rowKeys[j];
              agg = pivotData.getAggregator(rowKey, colKey);
              if (agg.value() != null) {
                val = agg.value();
                if ($.isNumeric(val)) {
                  if (val < 1) {
                    row.push(parseFloat(val.toPrecision(3)));
                  } else {
                    row.push(parseFloat(val.toFixed(3)));
                  }
                } else {
                  row.push(val);
                }
              } else {
                row.push(null);
              }
            }
            dataArray.push(row)
          }
          dataTable = google.visualization.arrayToDataTable(dataArray);
          title = vAxisTitle = fullAggName;
          hAxisTitle = pivotData.colAttrs.join('-');
          if (hAxisTitle !== '') {
            title += ' ' + opts.localeStrings.vs + ' ' + hAxisTitle;
          }
          groupByTitle = pivotData.rowAttrs.join('-');
          if (groupByTitle !== '') {
            title += ' ' + opts.localeStrings.by + ' ' + groupByTitle;
          }
        }
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
        }
        if (chartType === 'Bar') {
          options.chart = { title: title },
            options.legend = { position: 'absolute' },
            options.bars = 'horizontal',
            options.vAxis.maxValue = 0
        }
        if (chartType === 'Sankey') {
          let aggregator = pivotData.aggregatorName.toLowerCase()
          dataTable = new google.visualization.DataTable()
          dataTable.addColumn('string', `From`)
          dataTable.addColumn('string', `To`)
          dataTable.addColumn('number', aggregator)
          let rowData = [];
          for (let index in colKeys) {
            let colItem = colKeys[index]
            for (let index in colItem) {
              colItem[index] = String(colItem[index])
            }
            for (let index = 0; index < colItem.length - 1; index++) {
              let value = pivotData.colTotals[`${colItem.join('\u0000')}`].value()
              let colItemData = colItem.slice(index, index + 2)
              rowData.push(colItemData)
              colItemData.push(value)
            }
          }
          const values = {}
          const separator = '=>'
          rowData.forEach(item => {
            const key = item[0] + separator + item[1]
            if (values[key] === undefined) {
              values[key] = item[2]
              return
            }
            values[key] += item[2]
          })
          rowData = Object.entries(values).map(item => {
            const s = item[0].split(separator)
            return [...s, item[1]]
          })
          dataTable.addRows(rowData)
          console.log(pivotData)
          options.width = 800
        }
        else if (dataArray[0].length === 2 && dataArray[0][1] === '') {
          options.legend = {
            position: 'none'
          };
        }
        options = $.extend(true, {}, options, opts.gchart, extraOptions);
        result = $('<div>').css({
          width: '100%',
          height: '100%'
        })
        wrapper = new google.visualization.ChartWrapper({
          dataTable: dataTable,
          chartType: chartType,
          options: options
        });
        wrapper.draw(result[0]);
        result.bind('dblclick', function () {
          let editor;
          editor = new google.visualization.ChartEditor();
          google.visualization.events.addListener(editor, 'ok', function () {
            return editor.getChartWrapper().draw(result[0])
          })
          return editor.openDialog(wrapper);
        })
        return result;
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
    }
  })

}).call(this);
