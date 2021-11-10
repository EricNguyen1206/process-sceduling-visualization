const progressExecution = [];
const progressExecutionName = [];
const nonexclusiveExecution = [];
const nonexclusiveExecutionName = [];

const tableData = [];
const readyList = [];

function addRow() {
  let table = document.getElementsByClassName("table-row");
  let arrivetime = document.getElementsByClassName("arrivetime");
  let newRow = document.createElement("tr");

  let progress = document.createElement("td");
  progress.innerHTML = `P${table.length + 1}`;

  let timeArrive = document.createElement("td");
  let timeArriveValue = document.createElement("input");
  timeArriveValue.setAttribute("type", "number");
  timeArriveValue.setAttribute("min", 1);
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

  let priority = document.createElement("td");
  let priorityValue = document.createElement("input");
  priorityValue.setAttribute("type", "number");
  priorityValue.setAttribute("min", 1);
  priorityValue.setAttribute("max", 200);
  priorityValue.setAttribute("value", 1);
  priorityValue.addEventListener("change", recalculateServiceTime);
  priorityValue.classList.add("priority-input");
  priority.appendChild(priorityValue);
  priority.classList.add("initial", "priority-only");

  newRow.classList.add("table-row");
  newRow.append(progress, timeArrive, timeExecutes, priority);

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
    for (let i = 0; i <= n; i++) {
      total += parseInt(array[i]);
    }
    return total;
  } else {
    return 0;
  }
}

// Hàm tính thời gian chờ trung bình độc quyền
function averageWaitingTimeExclusive(numberOfProgression) {
  let total = 0;
  total = progressExecution.reduce((prev, cur) => prev + cur, 0);
  total -= progressExecution[progressExecution.length - 1];
  return total / numberOfProgression;
}

// Hàm tính thời gian chờ trung bình không độc quyền
function averageWaitingTimeNonexclusive(numberOfProgression) {
  var indexArray = [];
  let total = 0;
  for (let i = 0; i < tableData.length; i++) {
    var element = tableData[i].id;
    var idx = nonexclusiveExecutionName.indexOf(element);
    indexArray.splice(0, indexArray.length);
    while (idx != -1) {
      indexArray.push(idx);
      idx = nonexclusiveExecutionName.indexOf(element, idx + 1);
    }
    tableData[i].indexArray = indexArray;

    total += sumNfirstNumber(
      nonexclusiveExecution,
      nonexclusiveExecutionName.lastIndexOf(tableData[i].id)
    );
    for (let j = 0; j < indexArray.length; j++) {
      total -= nonexclusiveExecution[indexArray[j]];
    }
    total -= tableData[i].arrive;
  }
  return total / numberOfProgression;
}

// Hàm tính toán lại thời gian phục vụ của tiến trình khi dữ liệu hoặc thuật toán thay đổi
function recalculateServiceTime() {
  //chọn bảng hiển thị
  let table = document.getElementsByClassName("table-row");
  let arrivetime = document.getElementsByClassName("arrivetime");
  let executeTime = document.getElementsByClassName("exectime");
  let priorities = document.getElementsByClassName("priority-input");
  progressExecution.splice(0, progressExecution.length);
  progressExecutionName.splice(0, progressExecutionName.length);
  nonexclusiveExecution.splice(0, nonexclusiveExecution.length);
  nonexclusiveExecutionName.splice(0, nonexclusiveExecutionName.length);
  //biến đếm tổng lượt thực thi
  var totalExectuteTime = 0;
  tableData.splice(0, tableData.length);
  readyList.splice(0, readyList.length);
  for (let i = 0; i < table.length; i++) {
    let item = {};
    item.id = i;
    item.arrive = parseFloat(arrivetime[i].value);
    item.execute = parseFloat(executeTime[i].value);
    item.priority = parseInt(priorities[i].value);
    tableData.push(item);
  }

  document.getElementsByClassName("input-group")[0].style.visibility = "hidden";
  if (document.getElementById("fcfs").checked) {
    for (let i = 0; i < tableData.length + 1; i++) {
      document.getElementsByClassName("priority-only")[i].style.display =
        "none";
    }

    for (let index = 0; index < table.length; index++) {
      progressExecution.push(parseFloat(executeTime[index].value));
      progressExecutionName.push(index);
    }
  } else if (document.getElementById("robin").checked) {
    // Thuật toán điều phối xoay vòng
    // Tiến trình hiện tại sẽ được cấp 1 khoảng thời gian quantum để hoạt động
    // Hết thời gian quantum, cpu sẽ lấy lại và cấp cho tiến trình mới, tiến trình hiện tại được đưa vào queue
    // Nếu kết thúc trước thời gian quantum, cpu sẽ được cấp tiến trình tiếp theo
    // Các tiến trình sẽ được cấp cpu theo vòng cho đến khi xử lý xong
    let tableDataClone = tableData.map((item) => ({ ...item }));
    document.getElementsByClassName("input-group")[0].style.visibility =
      "visible";
    let quantum = parseInt(document.getElementById("quantum").value);
    executeTimeArr = [];

    for (let i = 0; i < tableData.length + 1; i++) {
      document.getElementsByClassName("priority-only")[i].style.display =
        "none";
    }

    for (let i = 0; i < tableDataClone.length; i++) {
      let progress = tableDataClone[i];
      if (progress.execute > quantum) {
        nonexclusiveExecution.push(quantum);
        nonexclusiveExecutionName.push(progress.id);
        progress.execute -= quantum;
        readyList.push(progress);
      } else {
        nonexclusiveExecution.push(progress.execute);
        nonexclusiveExecutionName.push(progress.id);
        progress.execute = 0;
      }
    }

    while (readyList.length) {
      let progress = readyList.shift();
      if (progress.execute > quantum) {
        nonexclusiveExecution.push(quantum);
        nonexclusiveExecutionName.push(progress.id);
        progress.execute -= quantum;
        readyList.push(progress);
      } else {
        nonexclusiveExecution.push(progress.execute);
        nonexclusiveExecutionName.push(progress.id);
      }
    }
  } else if (document.getElementById("priority").checked) {
    // PRIORITY ALGORITHM
    // Điều phối theo độ ưu tiên độc quyền
    // Các tiến trình được đưa vào ready list
    // Khi một tiến trình kết thúc, tiến trình mới được chọn dựa trên độ ưu tiên
    progressExecution.splice(0, progressExecution.length);
    progressExecutionName.splice(0, progressExecutionName.length);
    nonexclusiveExecution.splice(0, nonexclusiveExecution.length);
    nonexclusiveExecutionName.splice(0, nonexclusiveExecutionName.length);
    for (let i = 0; i < tableData.length + 1; i++) {
      document.getElementsByClassName("priority-only")[i].style.display =
        "block";
    }
    let tableDataClone = tableData.map((item) => ({ ...item }));
    let check = true;
    while (check) {
      check = false;
      let max = 0;
      let indexMax = 0;
      for (let i = 0; i < tableDataClone.length; i++) {
        if (totalExectuteTime == 0 && tableDataClone[i].priority != -1) {
          totalExectuteTime += tableDataClone[i].execute;
          progressExecution.push(tableDataClone[i].execute);
          progressExecutionName.push(i);
          tableDataClone[i].priority = -1;
          check = true;
          break;
        } else {
          if (tableDataClone[i].priority == -1) {
            continue;
          } else {
            if (
              tableDataClone[i].arrive <= totalExectuteTime &&
              tableDataClone[i].priority > max
            ) {
              max = tableDataClone[i].priority;
              indexMax = i;
            }
          }
        }
      }
      if (indexMax != 0) {
        totalExectuteTime += tableDataClone[indexMax].execute;
        progressExecution.push(tableDataClone[indexMax].execute);
        progressExecutionName.push(indexMax);
        tableDataClone[indexMax].priority = -1;
        check = true;
      }
    }

    // Điều phối theo Độ ưu tiên không độc quyền
    tableDataClone = tableData.map((item) => ({ ...item }));

    let currentProgress = -1; // biến đánh dấu tiến trình hiện tại
    readyList.splice(0, readyList.length);

    //Với mỗi tiến trình, xét xem độ ưu tiên-Priority có hơn không.
    //Nếu tiến trình không được ưu tiên sẽ vào ready list
    //Tiến trình ưu tiên hơn sẽ ngắt tiến trình hiện tại và cho vào ready list
    //Cập nhật lại ready list theo độ ưu tiên
    for (let i = 0; i < tableDataClone.length; i++) {
      let currentPriority =
        currentProgress > -1 ? tableDataClone[currentProgress].priority : 0;
      if (tableDataClone[i].priority > currentPriority) {
        if (currentProgress >= 0) {
          readyList.push(tableDataClone[currentProgress]);
        }
        currentProgress = i;
      } else {
        readyList.push(tableDataClone[i]);
        readyList.sort((a, b) => a.priority - b.priority);
      }

      //Nếu độ ưu tiên cao nhất và là tiến trình cuối
      //thực hiện liên tục không cần so sánh với tiến trình tiếp theo
      if (i == tableDataClone.length - 1) {
        nonexclusiveExecution.push(tableDataClone[currentProgress].execute);
        nonexclusiveExecutionName.push(currentProgress);
        tableDataClone[currentProgress].execute = 0;
      } else {
        //biến thời gian thực thi tiến trình hiện tại
        let progressTime = parseFloat(
          tableDataClone[i + 1].arrive - tableDataClone[i].arrive
        );

        if (tableDataClone[currentProgress].execute > progressTime) {
          nonexclusiveExecution.push(parseFloat(progressTime));
          nonexclusiveExecutionName.push(currentProgress);
          tableDataClone[currentProgress].execute -= progressTime;
        } else {
          nonexclusiveExecution.push(tableDataClone[currentProgress].execute);
          nonexclusiveExecutionName.push(currentProgress);
          tableDataClone[currentProgress].execute = 0;
          let newProgress = readyList.pop();
          currentProgress = newProgress.id;
        }
      }
    }
    while (readyList.length) {
      let progress = readyList.pop();
      if (!progress) continue;
      nonexclusiveExecution.push(progress.execute);
      nonexclusiveExecutionName.push(progress.id);
    }
  } else {
    progressExecution.splice(0, progressExecution.length);
    progressExecutionName.splice(0, progressExecutionName.length);
    nonexclusiveExecution.splice(0, nonexclusiveExecution.length);
    nonexclusiveExecutionName.splice(0, nonexclusiveExecutionName.length);
    totalExectuteTime = 0;
    readyList.splice(0, readyList.length);
    let tableDataClone = tableData.map((item) => ({ ...item }));

    for (let i = 0; i < tableDataClone.length + 1; i++) {
      document.getElementsByClassName("priority-only")[i].style.display =
        "none";
    }

    for (let i = 0; i < tableDataClone.length; i++) {
      if (tableDataClone[i].arrive > totalExectuteTime) {
        progressExecution.push(tableDataClone[i].execute);
        progressExecutionName.push(i);
        totalExectuteTime += tableDataClone[i].execute;
      } else {
        readyList.push(tableDataClone[i]);
        readyList.sort((a, b) => a.execute - b.execute);
      }
    }
    while (readyList.length) {
      let item = readyList.shift();
      progressExecution.push(item.execute);
      progressExecutionName.push(item.id);
    }

    tableDataClone = tableData.map((item) => ({ ...item }));
    readyList.splice(0, readyList.length);
    for (let i = 0; i < tableDataClone.length - 1; i++) {
      readyList.push(tableDataClone[i]);
      readyList.sort((a, b) => a.execute - b.execute);
      let servtime = parseFloat(
        tableDataClone[i + 1].arrive - tableDataClone[i].arrive
      );
      if (readyList[0].execute > servtime) {
        nonexclusiveExecution.push(servtime);
        nonexclusiveExecutionName.push(readyList[0].id);
        readyList[0].execute -= servtime;
      } else {
        nonexclusiveExecution.push(readyList[0].execute);
        nonexclusiveExecutionName.push(readyList[0].id);
        readyList.shift();
      }
    }
    readyList.push(tableDataClone[tableDataClone.length - 1]);
    readyList.sort((a, b) => a.execute - b.execute);

    while (readyList.length) {
      nonexclusiveExecution.push(readyList[0].execute);
      nonexclusiveExecutionName.push(readyList[0].id);
      readyList.shift();
    }
  }

  //Tính toán lại thời gian chờ trung bình
  document.getElementById("waiting-time-exclu").innerHTML = "";
  document.getElementById("waiting-time-exclu").innerHTML = parseFloat(
    averageWaitingTimeExclusive(tableData.length)
  ).toFixed(2);

  document.getElementById("waiting-time-nonex").innerHTML = "";
  document.getElementById("waiting-time-nonex").innerHTML = parseFloat(
    averageWaitingTimeNonexclusive(tableData.length)
  ).toFixed(2);

  //In ra kết quả trên console
  console.log("Tiến trình phân phối độc quyền: ", progressExecution);
  console.log("Thời gian phân phối độc quyền: ", progressExecutionName);
  console.log(
    "Thời gian chờ trung bình độc quyền",
    parseFloat(averageWaitingTimeExclusive(tableData.length)).toFixed(2)
  );
  console.log("Tiến trình phân phối Không độc quyền: ", nonexclusiveExecution);
  console.log(
    "Thời gian phân phối Không độc quyền: ",
    nonexclusiveExecutionName
  );
  console.log(
    "Thời gian chờ trung bình độc quyền",
    parseFloat(averageWaitingTimeNonexclusive(tableData.length)).toFixed(2)
  );
}

recalculateServiceTime();

// Hàm vẽ hình mô tả hoạt động thuật toán
const draw = function () {
  let exclusive = document.getElementById("exclusive");
  let nonexclusive = document.getElementById("nonexclusive");
  exclusive.innerHTML = "";
  nonexclusive.innerHTML = "";
  let delay = 0;
  for (let i = 0; i < progressExecution.length; i++) {
    let progress = document.createElement("p");
    progress.innerHTML = "P" + (progressExecutionName[i] + 1);
    progress.style.width = progressExecution[i] * 50 + "px";
    progress.style.animationDuration = progressExecution[i] + "s";
    progress.style.animationDelay = delay + "s";
    exclusive.appendChild(progress);
    delay += progressExecution[i];
  }

  if (
    document.getElementById("robin").checked ||
    document.getElementById("priority").checked ||
    document.getElementById("sjf").checked
  ) {
    delay = 0;
    for (let i = 0; i < nonexclusiveExecution.length; i++) {
      let progress = document.createElement("p");
      progress.innerHTML = "P" + (nonexclusiveExecutionName[i] + 1);
      progress.style.width = nonexclusiveExecution[i] * 40 + "px";
      progress.style.animationDuration = nonexclusiveExecution[i] / 2 + "s";
      progress.style.animationDelay = delay + "s";
      nonexclusive.appendChild(progress);
      delay += nonexclusiveExecution[i] / 2;
    }
  }
};
