const toJSArray = a => {
  var jsArray = [];
  for (var i = 0; i < a.length; i++) {
    jsArray[i] = a[i];
  }
  return jsArray;
};

function toJSMap(m) {
  var o = {};
  for (var i = 0; i < m.length; i++) {
    o[m[i][0]] = m[i][1];
  }
  return o;
}

function row_chart(card, data) {
  return StaticViz.RenderChart("row", {
    card: JSON.parse(card),
    data: JSON.parse(data),
  });
}

function combo_chart(series, settings, colors) {
  // Thinking of combo as similar to multiple, although they're different in BE
  return StaticViz.RenderChart("combo-chart", {
    series: JSON.parse(series),
    settings: JSON.parse(settings),
    colors: JSON.parse(colors),
  });
}

function timeseries_waterfall(data, labels, settings, instanceColors) {
  return StaticViz.RenderChart("timeseries/waterfall", {
    data: toJSArray(data),
    labels: toJSMap(labels),
    settings: JSON.parse(settings),
    colors: JSON.parse(instanceColors),
  });
}

function funnel(data, settings) {
  return StaticViz.RenderChart("funnel", {
    data: JSON.parse(data),
    settings: JSON.parse(settings),
  });
}

function categorical_donut(rows, colors) {
  return StaticViz.RenderChart("categorical/donut", {
    data: toJSArray(rows),
    colors: toJSMap(colors),
  });
}

function categorical_waterfall(data, labels, settings, instanceColors) {
  return StaticViz.RenderChart("categorical/waterfall", {
    data: toJSArray(data),
    labels: toJSMap(labels),
    settings: JSON.parse(settings),
    colors: JSON.parse(instanceColors),
  });
}

function progress(data, settings) {
  return StaticViz.RenderChart("progress", {
    data: JSON.parse(data),
    settings: JSON.parse(settings),
  });
}
