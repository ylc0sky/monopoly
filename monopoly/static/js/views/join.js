"use strict";

/**
 *WebSocket Interface
 */

/*const receivedMessage = {
    action: "join" | "start",
    data: [{
        id: "user_id",
        name: "user_name",
        avatar: "user_url"
    }]
};

const sentMessage = {
    action: "start"
};*/

class JoinView {
    constructor() {
        this.userName = document.getElementById("user-name").value;
        this.hostName = document.getElementById("host-name").value;
        this.friends = [this.userName];

        this.initComponents();
        this.initWebSocket();
    }

    initComponents() {
        this.$usersContainer = document.getElementById("joined-users-container");
        this.$startGame = document.getElementById("start-game");
        this.$startGame.addEventListener("click", () => {
            this.startGame();
        });

        if (this.userName === this.hostName) {
            this.$invitationLink = document.getElementById("invitation-url");
            this.$invitationLink.value = `${window.location.host}/monopoly/join/${this.hostName}`;

            this.$copyTooltip = document.getElementById("copied-tooltip");
            this.$copyButton = document.getElementById("share-invitation");
            this.$copyButton.addEventListener("click", () => {
                this.copyToClipboard();
            })
        }
    }

    initWebSocket() {
        this.socket = new WebSocket(`ws://${window.location.host}/join/${this.hostName}`);

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleStatusChange(message);
        }
    }

    handleStatusChange(message) {
        if (message.action === "join") {
            this.addFriend(message.data);

            if (this.friends.length > 1) {
                if (this.hostName !== this.userName) {
                    this.$startGame.innerHTML = "Waiting for host to start the game...";
                } else {
                    this.$startGame.disabled = false;
                    this.$startGame.innerHTML = "Start Game";
                }
            }
        } else if (message.action === "start") {
            this.navigateToGame();
        }
    }

    addFriend(friends) {
        for (let friend of friends) {
            if (this.friends.indexOf(friend.name) !== -1 || friend.name === this.userName) continue;

            this.friends.push(friend.name);

            const template = `<img class="joined-user-avatar" src="${friend.avatar}" title="${friend.name}">`;
            this.$usersContainer.innerHTML += template;
        }
    }

    startGame() {
        this.socket.send(JSON.stringify({
            action: "start"
        }));
    }

    navigateToGame() {
        window.location = `http://${window.location.host}/monopoly/game/${this.hostName}`;
    }

    copyToClipboard() {
        let copyText = this.$invitationLink;
        copyText.select();
        document.execCommand("Copy");

        this.$copyTooltip.classList.add("shown");
        setTimeout(() => {
            this.$copyTooltip.classList.remove("shown");
        }, 2000);
    }
}

window.onload = () => {
    new JoinView();
};