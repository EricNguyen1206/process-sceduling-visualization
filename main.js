const Execution = [];
const ExecutionName = [];
const tableData = [];
const readyList = [];
const waitingList = [];

function addRow() {
  let table = document.getElementsByClassName("table-row");
  let arrivetime = document.getElementsByClassName("arrivetime");
  let newRow = document.createElement("tr");

  let progress = document.createElement("td");
  progress.innerHTML = `P${table.length + 1}`;

  let timeArrive = document.createElement("td");
  let timeArriveValue = document.createElement("input");
  timeArriveValue.setAttribute("type", "number");
  timeArriveValue.setAttribute("min", 0);
  timeArriveValue.setAttribute("max", 200);
  timeArriveValue.setAttribute(
    "value",
    parseInt(arrivetime[arrivetime.length - 1].value) + 1
  );
  timeArriveValue.classList.add("initial", "arrivetime");
  timeArriveValue.addEventListener("change", recalculateServiceTime);
  timeArrive.appendChild(timeArriveValue);

  let timeExecutes = document.createElement("td");
  let timeExValue = document.createElement("input");
  timeExValue.setAttribute("type", "number");
  timeExValue.setAttribute("min", 1);
  timeExValue.setAttribute("max", 200);
  timeExValue.setAttribute("value", 1);
  timeExValue.classList.add("initial", "exectime");
  timeExValue.addEventListener("change", recalculateServiceTime);
  timeExecutes.appendChild(timeExValue);

  let waiting = document.createElement("td");
  let waitingValue = document.createElement("span");
  waitingValue.classList.add("waiting");
  waiting.appendChild(waitingValue);

  newRow.classList.add("table-row");
  newRow.append(progress, timeArrive, timeExecutes, waiting);

  document.getElementById("table-body").appendChild(newRow);
  recalculateServiceTime();
}

function deleteRow() {
  let tableBody = document.getElementById("table-body");
  tableBody.removeChild(tableBody.lastElementChild);
  recalculateServiceTime();
}

function sumNfirstNumber(array, n) {
  let total = 0;
  if (Array.isArray(array)) {
    for (let i = 0; i < n; i++) {
      total += array[i];
    }
    return total;
  } else {
    return 0;
  }
}

// H??m t??nh th???i gian ch??? trung b??nh
function averageWaitingTime(numberOfProgression) {
  if (ExecutionName.length === 0) {
    return NaN;
  }
  let indexArray = [];
  let total = 0;
  waitingList.splice(0, waitingList.length);

  for (let i = 0; i < tableData.length; i++) {
    let element = tableData[i].id;
    let idx = ExecutionName.indexOf(element);
    indexArray.splice(0, indexArray.length);
    while (idx != -1) {
      indexArray.push(idx);
      idx = ExecutionName.indexOf(element, idx + 1);
    }
    let x = 0;
    for (let j = 0; j < Execution.length; j++) {
      if (j == ExecutionName.lastIndexOf(tableData[i].id)) {
        break;
      }
      if (ExecutionName[j] != tableData[i].id) {
        x += Execution[j];
      }
    }
    x -= tableData[i].arrive;
    waitingList.push(x);
    console.log("Th???i gian ch??? P" + (i + 1), x);
    total += x;
  }
  console.log("Th???i gian ch??? trung b??nh:", total, "/", numberOfProgression, "= ", total / numberOfProgression);
  return total / numberOfProgression;
}

// H??m t??nh to??n l???i th???i gian ph???c v??? c???a ti???n tr??nh khi d??? li???u ho???c thu???t to??n thay ?????i
function recalculateServiceTime() {
  // Ch???n b???ng hi???n th??? v?? khai b??o bi???n
  let table = document.getElementsByClassName("table-row");
  let arrivetime = document.getElementsByClassName("arrivetime");
  let executeTime = document.getElementsByClassName("exectime");
  let waitingColumn = document.getElementsByClassName("waiting");
  let quantum = parseFloat(document.getElementById("quantum").value);
  console.log("quantum: " , quantum)
  let totalExecuteTime = 0;
  Execution.splice(0, Execution.length);
  ExecutionName.splice(0, ExecutionName.length);
  tableData.splice(0, tableData.length);
  readyList.splice(0, readyList.length);
  // L???y d??? li???u t??? b???ng
  for (let i = 0; i < table.length; i++) {
    let item = {};
    item.id = i;
    item.arrive = parseFloat(arrivetime[i].value);
    item.execute = parseFloat(executeTime[i].value);
    tableData.push(item);
  }

  // Thu???t to??n ??i???u ph???i xoay v??ng
  // Ti???n tr??nh hi???n t???i s??? ???????c c???p 1 kho???ng th???i gian quantum ????? ho???t ?????ng
  // Trong th???i gian quantum, c??c ti???n tr??nh t???i s??? ???????c cho v??o ready list
  // H???t th???i gian quantum, cpu s??? l???y l???i v?? c???p cho ti???n tr??nh m???i
  // Ti???n tr??nh ch??a x??? l?? xong ti???p t???c cho v??o ready list
  // N???u k???t th??c tr?????c th???i gian quantum, cpu s??? ???????c c???p ti???n tr??nh ti???p theo
  let progress = undefined;
  for (let i = 0; i < tableData.length; i++) {
    if (tableData[i].arrive <= totalExecuteTime) {
      readyList.push(tableData[i]);
      continue;
    }
    if(progress!=undefined) {
      if (progress.execute > 0) {
        readyList.push(progress);
      }
    }
    progress = readyList.shift();
    i--;

    if (progress.execute > quantum) {
      Execution.push(quantum);
      ExecutionName.push(progress.id);
      progress.execute -= quantum;
      totalExecuteTime += quantum;
    } else {
      Execution.push(progress.execute);
      ExecutionName.push(progress.id);
      totalExecuteTime += progress.execute;
      progress.execute = 0;
    }
  }
  if(progress != undefined) {
    if(progress.execute>0 && progress.id != readyList[readyList.length-1].id) {
      readyList.push(progress);
    }
  }

  // C??c ti???n tr??nh s??? ???????c c???p cpu theo v??ng cho ?????n khi x??? l?? xong
  while (readyList.length) {
    let progress = readyList.shift();
    if (progress.execute > quantum) {
      Execution.push(quantum);
      ExecutionName.push(progress.id);
      progress.execute -= quantum;
      readyList.push(progress);
    } else {
      Execution.push(progress.execute);
      ExecutionName.push(progress.id);
    }
  }

  // In ra k???t qu??? tr??n console
  console.log("Ph??n ph???i ti???n tr??nh: ", ExecutionName);
  console.log("Th???i gian ph??n ph???i: ", Execution);

  // T??nh to??n l???i th???i gian ch??? trung b??nh
  document.getElementById("waiting-time").innerHTML = "";
  document.getElementById("waiting-time").innerHTML = parseFloat(
    averageWaitingTime(tableData.length)
  ).toFixed(2);

  // Hi???n th??? tr??n b???ng d??? li???u
  for(let i = 0; i < waitingList.length; i++) {
    waitingColumn[i].innerHTML = waitingList[i];
  }
}

recalculateServiceTime();

// H??m v??? h??nh m?? t??? ho???t ?????ng thu???t to??n
function draw() {
  let execution = document.getElementById("execution");
  execution.innerHTML = "";
  let delay = 0;
  for (let i = 0; i < Execution.length; i++) {
    let progress = document.createElement("p");
    progress.innerHTML = "P" + (ExecutionName[i] + 1);
    progress.style.width = Execution[i] * 40 + "px";
    progress.style.animationDuration = Execution[i] / 2 + "s";
    progress.style.animationDelay = delay + "s";
    execution.appendChild(progress);
    delay += Execution[i] / 2;
  }
}
