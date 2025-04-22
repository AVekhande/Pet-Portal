document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");

    const chatForm = document.getElementById("chat-form");
    const chatMessages = document.querySelector(".chat-messages");
    const roomName = document.getElementById("room-name");
    const userList = document.getElementById("users");

    // Get username and room from URL
    const { username, room } = Qs.parse(location.search, {
        ignoreQueryPrefix: true,
    });

    if (!username || !room) {
        alert("Missing username or room data.");
        window.location.href = "/chat_ui.html";
    }

    const socket = io("http://localhost:3000");

    // Join chatroom
    socket.emit("joinRoom", { username, room });

    // Get room and users
    socket.on("roomUsers", ({ room, users }) => {
        roomName.innerText = room;
        userList.innerHTML = users.map(user => `<li>${user.username}</li>`).join('');
    });

    // Message from server
    socket.on("message", (message) => {
        console.log(message);
        outputMessage(message);

        // Scroll down
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Message submit
    if (chatForm) {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Get message text
            const msg = document.getElementById("msg").value;

            if (!msg.trim()) return;

            // Emit message to server
            socket.emit("chatMessage", msg);

            // Clear input after sending
            document.getElementById("msg").value = "";
            document.getElementById("msg").focus();
        });
    }

    // Output message to DOM
    function outputMessage(message) {
        const div = document.createElement("div");
        div.classList.add("message");
        div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                         <p class="text">${message.text}</p>`;
        chatMessages.appendChild(div);
    }
});
