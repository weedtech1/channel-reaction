/*
  CHANNEL REACTION BOT
  Frontend dashboard

  This file handles:
  - Channel settings
  - Reaction settings
  - Dashboard statistics
  - Demo posts
  - Start / Stop state
  - LocalStorage

  It does NOT create fake WhatsApp accounts
  or bypass WhatsApp security.
*/


const reactions = [
  { emoji: "😢", name: "Sad" },
  { emoji: "🥰", name: "Love" },
  { emoji: "🤩", name: "Wow" },
  { emoji: "🤣", name: "Funny" },
  { emoji: "🤷", name: "Confused" },
  { emoji: "🤑", name: "Money" },
  { emoji: "🧭", name: "Direction" },
  { emoji: "❤️‍🔥", name: "Heart Fire" },
  { emoji: "♥️", name: "Heart" },
  { emoji: "⌛️", name: "Time" },
  { emoji: "🎃", name: "Pumpkin" },
  { emoji: "🩵", name: "Blue Heart" },
  { emoji: "🪆", name: "Doll" }
];


let connected = false;
let running = false;

let posts = [];



/* =========================
   LOAD
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderReactions();

    loadSettings();

    loadPosts();

    updateStats();

    log("Dashboard loaded.");

  }
);



/* =========================
   REACTIONS
========================= */

function renderReactions() {

  const grid =
    document.getElementById("emojiGrid");

  grid.innerHTML = "";

  reactions.forEach(
    (item, index) => {

      const saved =
        localStorage.getItem(
          `reaction_${index}`
        );

      const value =
        saved !== null
          ? saved
          : 10;

      const card =
        document.createElement("div");

      card.className = "emoji-card";

      card.innerHTML = `

        <span class="emoji-icon">
          ${item.emoji}
        </span>

        <span class="emoji-name">
          ${item.name}
        </span>

        <input
          type="number"
          min="0"
          value="${value}"
          data-index="${index}"
          onchange="saveReaction(${index}, this.value)"
        >

      `;

      grid.appendChild(card);

    }
  );

}



function saveReaction(index, value) {

  let number =
    parseInt(value);

  if (
    isNaN(number) ||
    number < 0
  ) {
    number = 0;
  }

  localStorage.setItem(
    `reaction_${index}`,
    number
  );

  updateStats();

  log(
    `${reactions[index].emoji} quantity set to ${number}.`
  );

}



/* =========================
   CHANNEL
========================= */

function connectChannel() {

  const name =
    document
      .getElementById("channelName")
      .value
      .trim();

  const link =
    document
      .getElementById("channelLink")
      .value
      .trim();


  if (!name || !link) {

    log(
      "Please enter Channel name and link."
    );

    return;

  }


  localStorage.setItem(
    "channelName",
    name
  );

  localStorage.setItem(
    "channelLink",
    link
  );


  connected = true;


  document
    .getElementById("statusDot")
    .classList.add("online");


  document
    .getElementById("statusText")
    .textContent =
    "Connected";


  log(
    `Channel "${name}" configured.`
  );

}



/* =========================
   START
========================= */

function startBot() {

  if (!connected) {

    log(
      "Connect/configure your Channel first."
    );

    return;

  }


  running = true;


  document
    .getElementById("botStatus")
    .textContent =
    "Bot running";


  log(
    "Automation started."
  );


  /*
    The authorized WhatsApp integration
    should be connected here.

    This frontend intentionally does not
    bypass WhatsApp protections or create
    fake accounts.
  */

}



/* =========================
   STOP
========================= */

function stopBot() {

  running = false;


  document
    .getElementById("botStatus")
    .textContent =
    "Bot stopped";


  log(
    "Automation stopped."
  );

}



/* =========================
   DEMO POST
========================= */

function addDemoPost() {

  const post = {

    id: Date.now(),

    text:
      "This is a demo WhatsApp Channel post.",

    time:
      new Date()
        .toLocaleTimeString(),

    reactions:
      getReactionSettings()

  };


  posts.unshift(post);


  savePosts();

  renderPosts();

  updateStats();


  log(
    "Demo post added."
  );

}



/* =========================
   GET SETTINGS
========================= */

function getReactionSettings() {

  const result = [];


  reactions.forEach(
    (item, index) => {

      const saved =
        localStorage.getItem(
          `reaction_${index}`
        );


      const quantity =
        saved !== null
          ? parseInt(saved)
          : 10;


      if (quantity > 0) {

        result.push({

          emoji: item.emoji,

          quantity: quantity

        });

      }

    }
  );


  return result;

}



/* =========================
   RENDER POSTS
========================= */

function renderPosts() {

  const container =
    document.getElementById("posts");


  if (!posts.length) {

    container.innerHTML = `
      <div class="empty">
        No posts yet.
      </div>
    `;

    return;

  }


  container.innerHTML = "";


  posts.forEach(
    post => {

      const div =
        document.createElement("div");

      div.className = "post";


      const reactionHTML =
        post.reactions
          .map(
            reaction => `
              <span class="reaction-pill">
                ${reaction.emoji}
                ${reaction.quantity}
              </span>
            `
          )
          .join("");


      div.innerHTML = `

        <div class="post-top">

          <strong>
            Channel Post
          </strong>

          <span class="post-time">
            ${post.time}
          </span>

        </div>

        <div class="post-text">
          ${escapeHTML(post.text)}
        </div>

        <div class="post-reactions">
          ${reactionHTML}
        </div>

      `;


      container.appendChild(div);

    }
  );

}



/* =========================
   STORAGE
========================= */

function savePosts() {

  localStorage.setItem(
    "channel_posts",
    JSON.stringify(posts)
  );

}


function loadPosts() {

  const saved =
    localStorage.getItem(
      "channel_posts"
    );


  if (!saved) {

    posts = [];

    return;

  }


  try {

    posts =
      JSON.parse(saved);

  } catch {

    posts = [];

  }


  renderPosts();

}



function loadSettings() {

  const name =
    localStorage.getItem(
      "channelName"
    );

  const link =
    localStorage.getItem(
      "channelLink"
    );


  if (name) {

    document
      .getElementById("channelName")
      .value = name;

  }


  if (link) {

    document
      .getElementById("channelLink")
      .value = link;

  }


  if (name && link) {

    connected = true;

    document
      .getElementById("statusDot")
      .classList.add("online");

    document
      .getElementById("statusText")
      .textContent =
      "Connected";

  }

}



/* =========================
   STATISTICS
========================= */

function updateStats() {

  let configuredTypes = 0;

  let totalQuantity = 0;


  reactions.forEach(
    (item, index) => {

      const saved =
        localStorage.getItem(
          `reaction_${index}`
        );


      const value =
        saved !== null
          ? parseInt(saved)
          : 10;


      if (value > 0) {

        configuredTypes++;

      }


      totalQuantity += value;

    }
  );


  document
    .getElementById("postCount")
    .textContent =
    posts.length;


  document
    .getElementById("reactionCount")
    .textContent =
    configuredTypes;


  document
    .getElementById("totalCount")
    .textContent =
    totalQuantity;

}



/* =========================
   LOG
========================= */

function log(message) {

  const box =
    document.getElementById("log");


  const time =
    new Date()
      .toLocaleTimeString();


  const line =
    document.createElement("div");


  line.textContent =
    `[${time}] ${message}`;


  box.appendChild(line);


  box.scrollTop =
    box.scrollHeight;

}



/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}
