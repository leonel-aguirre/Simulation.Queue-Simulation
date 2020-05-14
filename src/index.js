const p5 = require("p5");
import { Dist } from "./Dist";
import Highcharts from "highcharts";

// Requires a json object with the information of posible operations.
let operations = require("./operations.json");

let timerSeconds = 25200;

//Top container elements.
let genButton = document.querySelector("#btn-generate");
let timer = document.querySelector("#timer-label");
let incButton = document.querySelector("#btn-increase");
let decButton = document.querySelector("#btn-decrease");

//Left container elements.
let meanSlider = document.querySelector("#mean-slider");
let meanValue = document.querySelector("#mean-value");
let devSlider = document.querySelector("#dev-slider");
let devValue = document.querySelector("#dev-value");

//Right container elements.
let clientTable = document.querySelector("#clients-table");

//Multi Slider.
let mSlider = document.querySelector(".multi-slider");
mSlider.setAttribute("amount", operations.length);
let sliderLabels = new Array(operations.length);

// Main method.
window.onload = () => {
  console.log(secondsToTime(Math.ceil(Dist.invNorm(0.4, 75, 8))));

  generateTable(operations);
  drawBellCurve(meanSlider.value, devSlider.value);

  for (let i = 0; i < sliderLabels.length; i++)
    sliderLabels[i] = document.querySelector(`#freq-val-${i}`);

  initMultiSlider(mSlider, sliderLabels);
  document.querySelector(".highcharts-credits").style.display = "none";
  setListeners();

  fillTable();
};

let fillTable = () => {
  console.log(meanSlider.value, devSlider.value);

  let nClients = parseInt(iterations.value);

  let arriveH = timerSeconds;
  let timeArrive = 0;
  let respH = arriveH;
  let waitT = 0;
  let operation = "";
  let opTime = 0;
  let leaveT = 0;

  let mean = parseInt(meanSlider.value);
  let std = parseInt(devSlider.value);

  let html = "";

  for (let i = 0; i < nClients; i++) {
    html += `<tr>`;
    html += `<td>${i + 1}</td>`;

    if (i > 0) arriveH += timeArrive;

    html += `<td>${secondsToTime(arriveH)}</td>`;

    timeArrive = Math.ceil(Dist.invNorm(Math.random(), mean, std));

    html += `<td>${secondsToTime(timeArrive)}</td>`;

    if (i > 0) respH = arriveH > leaveT ? arriveH : leaveT;

    html += `<td>${secondsToTime(respH)}</td>`;

    waitT = respH - arriveH;

    html += `<td>${secondsToTime(waitT)}</td>`;

    var frecs = mSlider.getAttribute("values").split(",");
    var accFrec = 0;
    var rnd = Math.random() * 100;

    for (let i = 0; i < frecs.length; i++) {
      accFrec += parseInt(frecs[i]);
      if (rnd <= accFrec) {
        operation = operations[i].operation;
        opTime = operations[i].seconds;
        break;
      }
    }

    html += `<td>${operation}</td>`;
    html += `<td>${secondsToTime(opTime)}</td>`;

    leaveT = respH + opTime;

    html += `<td>${secondsToTime(leaveT)}</td>`;
    html += `</tr>`;
  }

  clientTable.querySelector("tbody").innerHTML = html;
};

let generateTable = (operations) => {
  let tableHtml =
    "<thead><tr><th>Operacion</th><th>Tiempo</th><th>f</th></tr></thead>";

  for (let i = 0; i < operations.length; i++) {
    tableHtml += "<tr>";
    for (const key in operations[i]) {
      let value = operations[i][key];
      if (key == "seconds") value = secondsToTime(value);
      tableHtml += `<td>${value}</td>`;
    }
    tableHtml += `<td><div id=freq-val-${i} class='freq-data'><div class='color-indicator'></div><span>0%</span></div></td></tr>`;
  }

  tableHtml +=
    "<tfoot><tr><th>Operacion</th><th>Tiempo</th><th>f</th></tr></tfoot>";
  let tableElement = document.createElement("table");
  tableElement.classList.add("table-format");
  tableElement.innerHTML = tableHtml;

  document.querySelector("#operations").appendChild(tableElement);
};

let setListeners = () => {
  //Top container elements.

  // var incDecPressed = false;
  genButton.addEventListener("click", fillTable);

  // incButton.addEventListener("mousedown", () => {
  //   incDecPressed = true;
  //   while (incDecPressed) {
  //     setTimeout(() => {
  //       timerSeconds++;
  //       timer.textContent = secondsToTime(timerSeconds);
  //     }, 100);
  //   }
  // });

  // incButton.addEventListener("mouseup", () => {
  //   incDecPressed = false;
  // });

  document.addEventListener("keydown", (e) => {
    switch (e.which) {
      case 38:
        timerSeconds += 60;
        timer.textContent = secondsToTime(timerSeconds);
        break;
      case 40:
        timerSeconds -= 60;
        timer.textContent = secondsToTime(timerSeconds);
        break;
      case 13:
        sliderLabels.map((e) => {
          console.log(e.querySelector("span").textContent);
        });
        break;
    }
  });

  //Left container elements.
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
      width: null,
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
        color: "#06D6A0",
        fillColor: "#06D6A033",
        zoneAxis: "x",
      },
    },
  });
};

function initMultiSlider(multiSlider, labels) {
  let amount = multiSlider.getAttribute("amount");
  let min = multiSlider.getAttribute("min");
  let max = multiSlider.getAttribute("max");
  let values = new Array(amount);
  let freqText = new Array(amount);

  for (let i = 0; i < labels.length; i++) {
    let indicator = labels[i].querySelector(".color-indicator");
    indicator.style.background = `hsl(${
      (360 / labels.length) * (i + 1)
    }deg, 100%, 70%)`;

    freqText[i] = labels[i].querySelector("span");
  }

  let updateValues = (sliders) => {
    let actualV = 0;

    for (let i = 0; i < sliders.length; i++) {
      let sliderV = sliders[i].value;
      values[i] = sliderV - actualV;
      actualV = sliderV;
    }

    values[amount - 1] = max - actualV;

    multiSlider.setAttribute("values", values);

    for (let i = 0; i < values.length; i++)
      freqText[i].textContent = `${values[i]}%`;

    // console.log(values)

    let gradient = "to right, ";
    let aValue = 0;
    for (let i = 0; i < amount; i++) {
      if (i == 0) {
        aValue += values[i];
        gradient += `hsl(${
          (360 / amount) * (i + 1)
        }deg, 100%, 70%) ${aValue}% , `;
      } else if (i == amount - 1) {
        gradient += `hsl(${
          (360 / amount) * (i + 1)
        }deg, 100%, 70%) ${aValue}%, `;
        aValue += values[i];
        gradient += `hsl(${(360 / amount) * (i + 1)}deg, 100%, 70%) ${aValue}%`;
      } else {
        gradient += `hsl(${
          (360 / amount) * (i + 1)
        }deg, 100%, 70%) ${aValue}%, `;
        aValue += values[i];
        gradient += `hsl(${
          (360 / amount) * (i + 1)
        }deg, 100%, 70%) ${aValue}%, `;
      }
    }

    multiSlider.style.background = `linear-gradient(${gradient})`;
  };

  for (let i = 0; i < amount - 1; i++) {
    let newSlider = document.createElement("input");
    newSlider.type = "range";
    newSlider.classList.add(".m-slider");
    newSlider.min = min;
    newSlider.max = max;
    newSlider.setAttribute("value", ((max - min) / amount) * (i + 1));

    newSlider.addEventListener("input", (e) => {
      let parent = e.target.parentNode;
      let siblings = parent.getElementsByTagName("input");

      let slider = e.target;
      let val = parseFloat(slider.value);
      let leftLimit;
      let rightLimit;

      if (i == 0) {
        leftLimit = min;
        rightLimit = parseFloat(siblings[i + 1].value);
      } else if (i == amount - 2) {
        leftLimit = parseFloat(siblings[i - 1].value);
        rightLimit = max;
      } else {
        leftLimit = parseFloat(siblings[i - 1].value);
        rightLimit = parseFloat(siblings[i + 1].value);
      }

      if (val >= rightLimit) slider.value = rightLimit - 1;
      if (val <= leftLimit) slider.value = leftLimit + 1;

      updateValues(siblings);
    });

    multiSlider.appendChild(newSlider);
  }

  updateValues(multiSlider.getElementsByTagName("input"));
}
