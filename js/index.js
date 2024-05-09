let firebaseConfig = {
    apiKey: "AIzaSyBT8c6GHonTIIBfZXz01xHC1RFOyjnqZj8",
    authDomain: "randmisc.firebaseapp.com",
    databaseURL: "https://randmisc-default-rtdb.firebaseio.com",
    projectId: "randmisc",
    storageBucket: "randmisc.appspot.com",
    messagingSenderId: "664693850545",
    appId: "1:664693850545:web:daa5db09edcf16144dbd90"
};
firebase.initializeApp(firebaseConfig);
let database = firebase.database(), totalClicksRef = database.ref("clicks/total"), leaderboardRef = database.ref("clicks/leaderboard"), incrementButton = document.querySelector(".btn"), leaderboardTable = document.querySelector(".table tbody"), userName, userId = uuidv4();
function uuidv4() {
    return "xx-xx-4x-yxx-xxxx".replace(/[xy]/g, function (c) {
        var r = 16 * Math.random() | 0;
        return ("x" == c ? r : 0x3 & r | 0x8).toString(16);
    });
}
function incrementCounter() {
    database.ref(`clicks/users/${userId}`).transaction((currentValue) => (currentValue || 0) + 1, (error, committed, snapshot) => {
        error ? console.error("Error incrementing counter:", error) : committed && updateLeaderboard(snapshot.val());
    }), database.ref("clicks/total").transaction((currentValue) => (currentValue || 0) + 1, (error, committed, snapshot) => {
        error ? console.error("Error incrementing total clicks:", error) : committed && updateTotalClicks(snapshot.val()), activeUsersRef.transaction((currentValue) => (currentValue || 0) + 1, (error, committed) => {
            error && console.error("Error incrementing active users:", error);
        }), totalClicksTodayRef.transaction((currentValue) => (currentValue || 0) + 1, (error, committed) => {
            error && console.error("Error incrementing total clicks today:", error);
        });
    });
}
function createLeaderboardHtml(leaderboard) {
    return leaderboard.map((entry, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${formatNumberWithCommas(entry.clicks)}</td>
          </tr>
        `).join("");
}
function updateTotalClicks(total) {
    document.getElementById("totalClicks").textContent = formatNumberWithCommas(total);
}
function updateLeaderboard(userClicks) {
    leaderboardRef.once("value", (snapshot) => {
        let leaderboard = snapshot.val() || [], userEntry = leaderboard.find((entry) => entry.id === userId);
        userEntry ? userEntry.clicks = userClicks : (userEntry = {
            id: userId,
            username: userName || generateUsername(userId),
            clicks: userClicks
        }, leaderboard.push(userEntry)), leaderboard.sort((a, b) => b.clicks - a.clicks), leaderboard = leaderboard.slice(0, 10), leaderboardRef.set(leaderboard), leaderboardTable.innerHTML = createLeaderboardHtml(leaderboard);
    });
}
function formatNumberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function simulateUserInteraction() {
    (incrementButton = document.getElementById('increment-button')).addEventListener('click', incrementCounter), (!(userName = localStorage.getItem('userName')) || 0.1 > Math.random()) && (userName = generateUsername(uuidv4()), localStorage.setItem('userName', userName)), document.getElementById('leaderboard-name').value = userName, document.getElementById('set-name').click();
    let clicksPerBurst = Math.floor(10 * Math.random()) + 1, pauseBetweenClicks = Math.floor(1000 * Math.random()) + 100, burstsPerSession = Math.floor(10 * Math.random()) + 1, totalClicks = localStorage.getItem('totalClicks') || 0, burstCount = 0, clickSimulation = setInterval(() => {
        for (let i = 0; i < clicksPerBurst; i++)setTimeout(() => {
            !(0.05 > Math.random()) && (incrementButton.click(), totalClicks++);
        }, i * pauseBetweenClicks);
        ++burstCount >= burstsPerSession && (clearInterval(clickSimulation), localStorage.setItem('totalClicks', totalClicks));
    }, 1000 * (Math.floor(15 * Math.random()) + 1) + (Math.floor(5000 * Math.random()) + 1000));
    newUsersTodayRef.transaction((currentValue) => (currentValue || 0) + 1, (error, committed) => {
        error && console.error("Error incrementing new users today:", error);
    });
}
function generateUsername(uuid) {
    return uuid.replace(/-/g, '');
}
totalClicksRef.on('value', (snapshot) => {
    updateTotalClicks(snapshot.val() || 0);
}), document.getElementById('set-name').addEventListener('click', function () {
    if (!(userName = document.getElementById('leaderboard-name').value.trim())) {
        alert('Please enter a valid name.');
        return;
    }
    userId = uuidv4(), updateLeaderboard(database.ref(`clicks/users/${userId}`).once('value').then((snapshot) => snapshot.val()) || 0);
}), incrementButton.addEventListener("click", () => {
    incrementCounter();
});
let activeUsersElement = document.getElementById('activeUsers'), totalClicksTodayElement = document.getElementById('totalClicksToday'), newUsersTodayElement = document.getElementById('newUsersToday');
leaderboardRef.on("value", (snapshot) => {
    let leaderboard = snapshot.val() || [];
    leaderboardTable.innerHTML = createLeaderboardHtml(leaderboard);
}), setInterval(simulateUserInteraction, 60000), activeUsersRef.on('value', (snapshot) => {
    let activeUsers = snapshot.val() || 0;
    activeUsersElement.textContent = activeUsers;
}), totalClicksTodayRef.on('value', (snapshot) => {
    let totalClicksToday = snapshot.val() || 0;
    totalClicksTodayElement.textContent = totalClicksToday;
}), newUsersTodayRef.on('value', (snapshot) => {
    let newUsersToday = snapshot.val() || 0;
    newUsersTodayElement.textContent = newUsersToday;
});
