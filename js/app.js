$(function () {
    let renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.sankeyplus_renderers)
    // google.load('visualization', 'current', { packages: ['corechart', 'charteditor'] })
    // google.charts.load('current', { 'packages': ['corechart', 'bar', 'sankey'] });
    $.getJSON('data/mds.json', function (data) {
        $('#content').pivotUI(
            data, {
            renderers: renderers,
            rows: ['Gender'],
            cols: ['Age Bin', "Party", "Province"],
            rendererName: 'Диаграмма Санкей',
            derivedAttributes: {
                "Age Bin": $.pivotUtilities.derivers.bin("Age", 10)
            },
            rendererOptions: {
                gchart: { width: 800, height: 800 }
            },
            rowOrder: "value_a_to_z", colOrder: "value_z_to_a",
        }, false, 'ru'
        )
    }
    )
}
)
