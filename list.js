const form = document.getElementById('form');
const input = document.getElementById('input');
const daySelect = document.getElementById('day-select');
const timeSelect = document.getElementById('time-select');
const list = document.getElementById('list');
const historyList = document.getElementById('history-list'); // New history list element
const toggleHistoryBtn = document.getElementById('toggle-history-btn'); // Toggle button

let activeTask = null; // Track the currently active task
let historyOfTheDay = []; // Store completed tasks

// Get current day of the week
function getCurrentDay() {
    const now = new Date();
    return now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); // e.g., 'tuesday'
}

// Function to display current date and time
function updateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('current-time').innerText = now.toLocaleString('en-US', options);
}

// Update time every second
setInterval(updateTime, 1000);

// Initial call to display time immediately
updateTime();

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const item = input.value.trim();
    const day = daySelect.value;
    const time = parseInt(timeSelect.value); // Get selected time in seconds

    if (item !== '' && day !== '' && time > 0) {
        const currentDay = getCurrentDay();
        
        if (day.toLowerCase() !== currentDay) {
            alert(`You can only start tasks for today, which is ${currentDay.charAt(0).toUpperCase() + currentDay.slice(1)}.`);
            return;
        }

        addItem(`${item} - ${day.charAt(0).toUpperCase() + day.slice(1)}`, time);
        input.value = '';
        daySelect.selectedIndex = 0;
        timeSelect.selectedIndex = 0; // Reset dropdown
    } else {
        alert("Please enter a task, select a day, and choose a time.");
    }
});

function loadItems() {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    items.forEach((item) => addItem(item.text, item.time));
}

window.addEventListener('load', loadItems);

function addItem(item, time) {
    const li = document.createElement('li');
    
    li.innerHTML = `
        <span class="item">${item} - ${time} sec</span>
        <button class="start" onclick="startTimer(this, ${time})">Start</button>
        <button class="edit" onclick="edit(this)">Edit</button>
        <button class="delete">X</button>
    `;
    
    list.appendChild(li);

    const deleteButton = li.querySelector('.delete');
    deleteButton.addEventListener('click', () => {
        li.remove();
        saveItems();
    });

    saveItems();
}

function startTimer(e, totalTime) {
    if (activeTask) {
        alert("You can't start multiple tasks at the same time. Please finish the current task before starting a new one.");
        return;
    }

    activeTask = e.parentElement; // Set the current task as active
    const itemText = activeTask.querySelector('.item').textContent;

    let timeLeft = totalTime; // Total time in seconds
    const interval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(interval);
            alert(`Time's up for "${itemText.split('-')[0]}".`);
            historyOfTheDay.push(itemText); // Store completed task
            updateHistory(); // Update history display
            activeTask = null; // Reset active task
            return;
        }
        
        timeLeft--;
        activeTask.querySelector('.item').textContent = `${itemText.split('-')[0]} - ${timeLeft} sec`;
        
        saveItems(); // Save updated time in local storage
    }, 1000); // Decrement every second
}

function updateHistory() {
    historyList.innerHTML = ''; // Clear current history display
    historyOfTheDay.forEach(task => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <input type="checkbox" class="completed-checkbox" onclick="removeCompleted(this)" checked />
            ${task}
        `;
        
        historyList.appendChild(li);
    });
}

function removeCompleted(checkbox) {
    const li = checkbox.parentElement;
    li.remove(); // Remove from displayed history
}

toggleHistoryBtn.addEventListener('click', () => {
    if (historyList.style.display === 'none') {
        historyList.style.display = 'block';
        toggleHistoryBtn.textContent = 'Hide Completed Tasks';
    } else {
        historyList.style.display = 'none';
        toggleHistoryBtn.textContent = 'Show Completed Tasks';
    }
});

function edit(e) {
    let update = prompt("Update task:", e.parentElement.querySelector('.item').textContent);
    
    if (update !== null && update.trim() !== '') { 
        e.parentElement.querySelector('.item').textContent = update;
        
        saveItems();
    }
}

function saveItems() {
    const items = Array.from(list.children).map((li) => {
        const textContent = li.querySelector('.item').textContent.split(' - ');
        return { text: textContent[0], time: parseInt(textContent[1]) };
    });
    
    localStorage.setItem('items', JSON.stringify(items));
}