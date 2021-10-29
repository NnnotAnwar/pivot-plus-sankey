google.load('visualization', '1', { packages: ['corechart', 'charteditor'] })

google.charts.load('current', { 'packages': ['corechart', 'bar', 'sankey'] });


$(function () {
    var renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.gchart_renderers)
    $.getJSON('data/mds.json', function (data) {
        $('#content').pivotUI(
            data, {
            renderers: renderers,
            rendererOptions: {
                gchart: { width: 800, height: 600 }
            }
        }
        )
    }
    )
}
)