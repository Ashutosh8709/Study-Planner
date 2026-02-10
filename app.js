let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let schedules = JSON.parse(localStorage.getItem("schedules")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function save() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("schedules", JSON.stringify(schedules));
  localStorage.setItem("tasks", JSON.stringify(tasks));

  updateDashboard();
  updateAnalytics();
}

function show(id) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) return alert(msg);

  toast.innerText = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function addSubject() {
  let name = document.getElementById("subjectName").value;
  let priority = document.getElementById("priority").value;

  if (!name) return;

  subjects.push({ name, priority });

  renderSubjects();
  save();
}

function renderSubjects() {
  let list = document.getElementById("subjectList");
  list.innerHTML = "";

  const order = { High: 1, Medium: 2, Low: 3 };
  subjects.sort((a, b) => order[a.priority] - order[b.priority]);

  subjects.forEach((s, i) => {
    list.innerHTML += `
<li>
${s.name} (${s.priority})
<button onclick="deleteSubject(${i})">Delete</button>
</li>`;
  });
}

function deleteSubject(i) {
  subjects.splice(i, 1);
  renderSubjects();
  save();
}

function addSchedule() {
  let day = document.getElementById("day").value;
  let time = document.getElementById("time").value;
  let topic = document.getElementById("studyTopic").value;

  let conflict = schedules.find((s) => s.day === day && s.time === time);

  if (conflict) {
    showToast("Time conflict detected!");
    return;
  }

  schedules.push({
    day,
    time,
    topic,
    completed: false,
  });

  renderSchedule();
  renderCalendar();
  save();
  showToast("Study slot added");
}

function toggleSchedule(i) {
  schedules[i].completed = !schedules[i].completed;
  renderSchedule();
  renderCalendar();
  save();
}

function deleteSchedule(i) {
  schedules.splice(i, 1);
  renderSchedule();
  renderCalendar();
  save();
}

function renderSchedule() {
  let list = document.getElementById("scheduleList");
  if (!list) return;

  list.innerHTML = "";

  schedules.forEach((s, i) => {
    list.innerHTML += `
<li class="${s.completed ? "completed" : ""}">
<input type="checkbox"
${s.completed ? "checked" : ""}
onclick="toggleSchedule(${i})">

${s.day} ${s.time} - ${s.topic}

<button onclick="deleteSchedule(${i})">Delete</button>
</li>`;
  });
}

const days = ["Time", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function renderCalendar() {
  let calendar = document.getElementById("calendar");
  if (!calendar) return;

  calendar.innerHTML = "";

  days.forEach((d) => {
    calendar.innerHTML += `<div class="cell header">${d}</div>`;
  });

  let times = ["09:00", "10:00", "11:00", "12:00", "13:00"];

  times.forEach((time) => {
    calendar.innerHTML += `<div class="cell header">${time}</div>`;

    for (let i = 1; i < days.length; i++) {
      let slot = schedules.find((s) => s.day === days[i] && s.time === time);

      calendar.innerHTML += `
<div class="cell ${slot?.completed ? "completed" : ""}">
${
  slot
    ? `<input type="checkbox"
${slot.completed ? "checked" : ""}
onclick="toggleCalendar('${days[i]}','${time}')">

${slot.topic}`
    : ""
}
</div>`;
    }
  });
}

function toggleCalendar(day, time) {
  let index = schedules.findIndex((s) => s.day === day && s.time === time);

  if (index > -1) {
    schedules[index].completed = !schedules[index].completed;
    renderSchedule();
    renderCalendar();
    save();
  }
}

function addTask() {
  let name = document.getElementById("taskName").value;
  let deadline = document.getElementById("deadline").value;

  if (!name) return;

  tasks.push({
    name,
    deadline,
    completed: false,
  });

  renderTasks();
  checkReminders();
  save();

  showToast("Task added");
}

function toggleTask(i) {
  tasks[i].completed = !tasks[i].completed;
  renderTasks();
  save();
}

function deleteTask(i) {
  tasks.splice(i, 1);
  renderTasks();
  save();
}

function renderTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((t, i) => {
    list.innerHTML += `
<li class="${t.completed ? "completed" : ""}">
<input type="checkbox"
${t.completed ? "checked" : ""}
onclick="toggleTask(${i})">

${t.name} - ${t.deadline}

<button onclick="deleteTask(${i})">Delete</button>
</li>`;
  });
}

function checkReminders() {
  let today = new Date().toISOString().split("T")[0];

  tasks.forEach((t) => {
    if (t.deadline === today && !t.completed) {
      showToast("Reminder: " + t.name + " due today!");
    }
  });
}

function updateDashboard() {
  document.getElementById("totalSubjects").innerText = subjects.length;

  let pending = tasks.filter((t) => !t.completed).length;
  document.getElementById("totalTasks").innerText = pending;

  let today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });

  let todayList = schedules.filter((s) => s.day === today);

  document.getElementById("todaySlots").innerText = todayList.length;
}

function updateAnalytics() {
  let totalTasks = tasks.length;
  let completedTasks = tasks.filter((t) => t.completed).length;

  let percentage = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  let insight = "Start building momentum";

  if (percentage > 70) insight = "Excellent consistency!";
  else if (percentage > 40) insight = "Good progress!";
  else if (percentage > 10) insight = "Keep pushing forward!";

  document.getElementById("analyticsData").innerHTML = `
Completion Rate: ${percentage}%

<div class="progressBar">
<div class="progressFill" style="width:${percentage}%"></div>
</div>

<br>${insight}
`;
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function exportData() {
  let data = { subjects, schedules, tasks };
  let blob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "studyplanner.json";
  a.click();
}

function resetData() {
  localStorage.clear();
  location.reload();
}

renderSubjects();
renderSchedule();
renderCalendar();
renderTasks();
updateDashboard();
updateAnalytics();
