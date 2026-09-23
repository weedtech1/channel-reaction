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

let posts = [];

document.addEventListener("DOMContentLoaded", () => {
  renderReactions();
  loadSettings();
  loadPosts();
  updateStats();
  log("Dashboard ready.");
});


/* =========================
   CHANNEL VERIFICATION
========================= */

function verifyChannel() {

  const input =
    document.getElementById("channelLink");

  const result =
    document.getElementById("channelResult");

  const link =
    input.value.trim();


  if (!link) {

    result.className =
      "result error-result";

    result.textContent =
      "❌ Mete link WhatsApp Channel la.";

    setOffline();

    return;
  }


  let valid = false;


  try {

    const url = new URL(link);

    valid =
      url.hostname === "whatsapp.com" &&
      url.pathname.startsWith("/channel/");

  } catch {

    valid = false;

  }


  if (!valid) {

    result.className =
      "result error-result";

    result.textContent =
      "❌ Link la pa sanble ak yon WhatsApp Channel link.";

    setOffline();

    log("Invalid Channel link.");

    return;
  }


  localStorage.setItem(
    "channelLink",
    link
  );


  result.className =
    "result success-result";

  result.textContent =
    "✅ Channel link verifye. Li pare pou itilize nan dashboard la.";


  setOnline();


  log("Channel link verified.");

}


/* =========================
   STATUS
========================= */

function setOnline() {

  document
    .getElementById("statusDot")
    .classList.add("online");

  document
    .getElementById("statusText")
    .textContent =
    "Channel ready";
}


function setOffline() {

  document
    .getElementById("statusDot")
    .classList.remove("online");

  document
    .getElementById("statusText")
    .textContent =
    "Not connected";
}


/* =========================
   REACTIONS
========================= */

function renderReactions() {

  const grid =
    document.getElementById("emojiGrid");

  grid.innerHTML = "";

  reactions.forEach((item, index) => {

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

    card.className =
      "emoji-card";

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
        onchange="saveReaction(${index}, this.value)"
      >

    `;

    grid.appendChild(card);

  });

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

}


/* =========================
   PREPARE
========================= */

function prepareReactions() {

  const link =
    localStorage.getItem(
      "channelLink"
    );


  if (!link) {

    document
      .getElementById("botStatus")
      .textContent =
      "❌ Verify Channel link first.";

    return;
  }


  const settings =
    getReactionSettings();


  const total =
    settings.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );


  document
    .getElementById("botStatus")
    .textContent =
    `✅ ${total} reactions configured for this Channel.`;

  log(
    `Prepared ${total} reaction quantity.`
  );

}


/* =========================
   GET SETTINGS
========================= */

function getReactionSettings() {

  const result = [];


  reactions.forEach((item, index) => {

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

  });


  return result;
}


/* =========================
   DEMO POSTS
========================= */

function addDemoPost() {

  const post = {

    id: Date.now(),

    text:
      "Demo WhatsApp Channel post.",

    time:
      new Date().toLocaleTimeString(),

    reactions:
      getReactionSettings()

  };


  posts.unshift(post);

  savePosts();

  renderPosts();

  updateStats();

  log("Demo post added.");

}


/* =========================
   POSTS
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


  posts.forEach(post => {

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

  });

}


/* =========================
   STORAGE
========================= */

function loadSettings() {

  const link =
    localStorage.getItem(
      "channelLink"
    );


  if (link) {

    document
      .getElementById("channelLink")
      .value = link;

  }

}


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


/* =========================
   CLEAR
========================= */

function clearSettings() {

  localStorage.removeItem(
    "channelLink"
  );


  reactions.forEach((item, index) => {

    localStorage.removeItem(
      `reaction_${index}`
    );

  });


  document
    .getElementById("channelLink")
    .value = "";


  document
    .getElementById("channelResult")
    .className = "result";


  document
    .getElementById("channelResult")
    .textContent =
    "Pa gen Channel verifye toujou.";


  setOffline();

  renderReactions();

  updateStats();

  log("Settings cleared.");

}


/* =========================
   STATS
========================= */

function updateStats() {

  let types = 0;

  let total = 0;


  reactions.forEach((item, index) => {

    const saved =
      localStorage.getItem(
        `reaction_${index}`
      );


    const value =
      saved !== null
        ? parseInt(saved)
        : 10;


    if (value > 0) {
      types++;
    }


    total += value;

  });


  document
    .getElementById("postCount")
    .textContent =
    posts.length;


  document
    .getElementById("reactionCount")
    .textContent =
    types;


  document
    .getElementById("totalCount")
    .textContent =
    total;

}


/* =========================
   LOG
========================= */

function log(message) {

  const box =
    document.getElementById("log");


  const time =
    new Date().toLocaleTimeString();


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

  div.textContent =
    text;

  return div.innerHTML;

}
