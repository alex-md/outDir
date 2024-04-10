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
let database = firebase.database(), leaderboardRef = database.ref("clicks/leaderboard"), incrementButton = document.querySelector("#increment-button"), leaderboardTable = document.querySelector("#leaderboard tbody");
function uuidv4() {
    return "xx-xx-4x-yxx-xxxx".replace(/[xy]/g, function (c) {
        var r = 16 * Math.random() | 0;
        return ("x" == c ? r : 0x3 & r | 0x8).toString(16);
    });
}
function generateUsername(uuid) {
    return uuid.replace(/-/g, '');
}
let userId = uuidv4();
function incrementCounter() {
    database.ref(`clicks/users/${userId}`).transaction((currentValue) => (currentValue || 0) + 1, (error, committed, snapshot) => {
        error ? console.error("Error incrementing counter:", error) : committed && updateLeaderboard(snapshot.val());
    }), database.ref("clicks/total").transaction((currentValue) => (currentValue || 0) + 1, (error, committed, snapshot) => {
        error ? console.error("Error incrementing total clicks:", error) : committed && updateTotalClicks(snapshot.val());
    });
}
function createLeaderboardHtml(leaderboard) {
    return leaderboard.map((entry, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${entry.clicks}</td>
          </tr>
        `).join("");
}
function updateTotalClicks(total) {
    document.getElementById("total-clicks").textContent = `Total clicks: ${total}`;
}
function updateLeaderboard(userClicks) {
    leaderboardRef.once("value", (snapshot) => {
        let leaderboard = snapshot.val() || [], userEntry = leaderboard.find((entry) => entry.id === userId);
        if (userEntry) userEntry.clicks = userClicks;
        else {
            let username = generateUsername(userId);
            userEntry = {
                id: userId,
                clicks: userClicks,
                username: username
            }, leaderboard.push(userEntry);
        }
        leaderboard.sort((a, b) => b.clicks - a.clicks), leaderboard = leaderboard.slice(0, 10), leaderboardRef.set(leaderboard), leaderboardTable.innerHTML = createLeaderboardHtml(leaderboard);
    });
}
incrementButton.addEventListener("click", () => {
    incrementCounter();
}), leaderboardRef.on("value", (snapshot) => {
    let leaderboard = snapshot.val() || [];
    leaderboardTable.innerHTML = createLeaderboardHtml(leaderboard);
}), database.ref("clicks/total").on("value", (snapshot) => {
    updateTotalClicks(snapshot.val() || 0);
});
