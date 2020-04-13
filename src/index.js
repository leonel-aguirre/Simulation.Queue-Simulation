const p5 = require("p5");
import Highcharts from "highcharts";

let operations = require("./operations.json");

let canvas;
let res = 9;

let meanSlider = document.querySelector("#mean-slider");
let meanValue = document.querySelector("#mean-value");
let devSlider = document.querySelector("#dev-slider");
let devValue = document.querySelector("#dev-value");

let sketch = (p) => {
  p.setup = () => {
    canvas = p.createCanvas(500, 500);
    canvas.parent("canvas");
    generateTable(operations);
    drawBellCurve(meanSlider.value, devSlider.value);
    document.querySelector(".highcharts-credits").style.display = "none";
    setListeners();
  };

  p.draw = () => {
    p.background(200);
    drawGrid(p);
  };
};

let drawGrid = (p) => {
  p.push();
  p.strokeWeight(1);
  p.stroke("#3333");
  for (let i = 0; i < res; i++) {
    p.line((p.width / res) * i, 0, (p.width / res) * i, p.height);
    p.line(0, (p.height / res) * i, p.width, (p.height / res) * i);
  }
  p.pop();
};

let generateTable = (operations) => {
  let tableHtml = "<thead><tr><th>Operacion</th><th>Tiempo</th></tr></thead>";

  for (let i = 0; i < operations.length; i++) {
    tableHtml += "<tr>";
    for (const key in operations[i]) {
      let value = operations[i][key];
      if (key == "seconds") value = secondsToTime(value);
      tableHtml += `<td>${value}</td>`;
    }
    tableHtml += "</tr>";
  }

  tableHtml += "<tfoot><tr><th>Operacion</th><th>Tiempo</th></tr></tfoot>";
  let tableElement = document.createElement("table");
  tableElement.classList.add("operations-table");
  tableElement.innerHTML = tableHtml;

  document.querySelector("#operations").appendChild(tableElement);
};

let setListeners = () => {
  meanSlider.addEventListener("input", (e) => {
    drawBellCurve(e.target.value, devSlider.value);
    document.querySelector(".highcharts-credits").style.display = "none";
    meanValue.textContent = secondsToTime(meanSlider.value);
  });

  devSlider.addEventListener("input", (e) => {
    drawBellCurve(meanSlider.value, e.target.value);
    document.querySelector(".highcharts-credits").style.display = "none";
    devValue.textContent = secondsToTime(devSlider.value);
  });
};

let secondsToTime = (s) => {
  let m = Math.floor(s / 60);
  s = s % 60;
  let h = Math.floor(m / 60);
  m = m % 60;

  h = h.toString().length == 1 ? 0 + h.toString() : h;
  m = m.toString().length == 1 ? 0 + m.toString() : m;
  s = s.toString().length == 1 ? 0 + s.toString() : s;

  return `${h}:${m}:${s}`;
};

const bellCurvePoint = (x, mean, stdDev) =>
  (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
  Math.E ** ((-1 / 2) * ((x - mean) / stdDev) ** 2);

const drawBellCurve = (mean, stdDev) => {
  let points = [];

  for (let i = 0; i < mean * 2; i++) {
    points.push(bellCurvePoint(i, mean, stdDev));
  }

  Highcharts.chart("chart", {
    title: {
      text: "Distribucion Normal",
    },
    chart: {
      type: "area",
      height: null,
      backgroundColor: "#3333",
      style: {
        fontFamily: "Varela Round",
      },
    },
    xAxis: {
      labels: {
        formatter: function () {
          var label = this.axis.defaultLabelFormatter.call(this);

          return secondsToTime(label).substring(3, 8);
        },
      },
    },
    yAxis: {
      labels: {
        enabled: false,
      },
      gridLineWidth: 0,
      title: "",
    },
    tooltip: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        data: points,
      },
    ],
    plotOptions: {
      series: {
        animation: false,
      },
      area: {
        enableMouseTracking: true,
        color: "#333",
        fillColor: "#3338",
        zoneAxis: "x",
      },
    },
  });
};

new p5(sketch);
