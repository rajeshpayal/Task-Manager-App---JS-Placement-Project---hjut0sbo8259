const formVisibility = document.getElementById("task-form");
const addButton = document.getElementById("add-task-button");
const submitButton = document.getElementById("submit-button");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");

const openContainer = document.getElementById("open");
const inProgressContainer = document.getElementById("inProgress");
const inReviewContainer = document.getElementById("inReview");
const doneContainer = document.getElementById("done");
const error = document.getElementById("error");

const formInputName = document.querySelector("#task-name");
const formInputDesc = document.querySelector("#desc");
const formInputStatus = document.querySelector("#task-status");

let EDIT_ELEMENT = null;

let source = "";
let destination = "";

let allTasks = [
  { name: "open", tasks: [] },
  { name: "inProgress", tasks: [] },
  { name: "inReview", tasks: [] },
  { name: "done", tasks: [] },
];
const clearInputs = () => {
  formInputName.value = "";
  formInputDesc.value = "";
  formInputStatus.value = "";
};

addButton.addEventListener("click", (event) => {
  event.preventDefault();
  formVisibility.style.display = "block";
  submitButton.style.display = "block";
});

cancelButton.addEventListener("click", (event) => {
  event.preventDefault();
  error.innerText = "";
  formVisibility.style.display = "none";
  submitButton.style.display = "none";
  saveButton.style.display = "none";
  clearInputs();
});

submitButton.addEventListener("click", (event) => {
  event.preventDefault();

  const name = document.getElementById("task-name").value;
  const description = document.getElementById("desc").value;
  const taskStatus = document.getElementById("task-status").value;
  const startDate = document.querySelector("#start-date");
  const endDate = document.querySelector("#end-date");
  if (!name || !description) {
    error.innerText = "Please enter name and description";
    return;
  }
  const newTask = {
    id: `${new Date().getTime()}`,
    name,
    description,
    startDate,
    endDate,
  };

  const taskItem = document.createElement("li");
  taskItem.innerText = name;
  taskItem.setAttribute("id", `${newTask.id}`);
  taskItem.setAttribute("data-description", newTask.description);
  taskItem.setAttribute("draggable", "true");
  taskItem.setAttribute("ondragstart", "drag(event)");
  taskItem.setAttribute("onclick", "EditTask(event)");

  switch (taskStatus) {
    case "open":
      allTasks[0].tasks.push(newTask);
      openContainer.appendChild(taskItem);
      break;
    case "inProgress":
      allTasks[1].tasks.push(newTask);
      inProgressContainer.appendChild(taskItem);
      break;
    case "inReview":
      allTasks[2].tasks.push(newTask);
      inReviewContainer.appendChild(taskItem);
      break;
    case "done":
      allTasks[3].tasks.push(newTask);
      doneContainer.appendChild(taskItem);
      break;
  }

  document.getElementById("task-name").value = "";
  document.getElementById("desc").value = "";

  saveData();

  error.innerText = "";
  formVisibility.style.display = "none";
  submitButton.style.display = "none";
});

function saveData() {
  const tasks = JSON.stringify(allTasks);
  localStorage.setItem("tasks", tasks);
}

function getDataFromStorage() {
  const tasks = localStorage.getItem("tasks");
  allTasks = JSON.parse(tasks) ? JSON.parse(tasks) : allTasks;
  return allTasks;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  source = ev.target.parentElement.getAttribute("id");
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  const child = document.getElementById(data);
  ev.target.appendChild(document.getElementById(data));

  const targetLocation = ev.target.getAttribute("id");
  destination = targetLocation;

  const text = child.innerText;
  const id = child.getAttribute("id");
  const description = child.getAttribute("data-description");
  const taskData = { text, id, description };
  modifyTasklist(source, destination, taskData);
}

const modifyTasklist = (
  source,
  destination,
  data,
  shouldRemoveChild = false
) => {
  const { text, id, description } = data;
  const newTask = { id, name: text, description };

  if (source != destination) {
    switch (destination) {
      case "open":
        allTasks[0].tasks.push(newTask);
        break;
      case "inProgress":
        allTasks[1].tasks.push(newTask);
        break;
      case "inReview":
        allTasks[2].tasks.push(newTask);
        break;
      case "done":
        allTasks[3].tasks.push(newTask);
        break;
    }

    allTasks = allTasks.map((item) => {
      if (item.name === source) {
        return {
          name: source,
          tasks: item.tasks.filter((task) => task.id !== id),
        };
      } else return item;
    });
  } else {
    allTasks = allTasks.map((item) => {
      if (item.name === source) {
        return {
          name: source,
          tasks: item.tasks.map((task) => {
            if (task.id === id) {
              return newTask;
            } else {
              return task;
            }
          }),
        };
      } else return item;
    });
  }
  if (shouldRemoveChild) {
    const sourceContainer = document.getElementById(source);
    const destinationContainer = document.getElementById(destination);
    const item = document.getElementById(id);
    sourceContainer.removeChild(item);

    const taskItem = document.createElement("li");
    taskItem.innerText = text;
    taskItem.setAttribute("id", `${id}`);
    taskItem.setAttribute("data-description", description);
    taskItem.setAttribute("draggable", "true");
    taskItem.setAttribute("ondragstart", "drag(event)");
    taskItem.setAttribute("onclick", "EditTask(event)");
    destinationContainer.appendChild(taskItem);
  }
  saveData();
};

function EditTask(event) {
  event.preventDefault();
  formVisibility.style.display = "block";
  saveButton.style.display = "block";
  EDIT_ELEMENT = event.target;
  formValue(event);
}

saveButton.addEventListener("click", (event) => {
  event.preventDefault();
  const id = EDIT_ELEMENT?.getAttribute("id");

  const text = formInputName.value;
  const description = formInputDesc.value;

  const source = document.getElementById(id).parentElement.getAttribute("id");

  const dest = formInputStatus.value;

  const data = { text, id, description };
  modifyTasklist(source, dest, data, true);
  // setting id to null
  EDIT_ELEMENT = null;
  formVisibility.style.display = "none";
  formInputName.value = "";
  formInputDesc.value = "";
  formInputStatus.value = "";
});

function formValue(event) {
  const element = event.target;
  const source = element.parentElement.getAttribute("id");

  formInputName.value = element.innerText;
  formInputDesc.value = element.getAttribute("data-description");
  formInputStatus.value = source;
}

function renderList(parentId, data) {
  const parentElement = document.getElementById(parentId);

  const { text, id, description } = data;

  const taskItem = document.createElement("li");
  taskItem.innerText = text;
  taskItem.setAttribute("id", `${id}`);
  taskItem.setAttribute("data-description", description);
  taskItem.setAttribute("draggable", "true");
  taskItem.setAttribute("ondragstart", "drag(event)");
  taskItem.setAttribute("onclick", "EditTask(event)");
  parentElement.appendChild(taskItem);
}

function renderData() {
  getDataFromStorage();
  const sectoins = ["open", "inProgress", "inReview", "done"];

  allTasks?.forEach((item, index) => {
    if (item.tasks.length == 0) {
      return;
    }
    item.tasks?.forEach((task) => {
      const text = task.name;
      const description = task.description;
      const id = task.id;
      const data = { text, id, description };
      const parentId = sectoins[index];
      renderList(parentId, data);
    });
  });
}

renderData();
