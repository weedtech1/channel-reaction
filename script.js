const BACKEND_URL = "https://channel-reaction-backend.onrender.com";

const reactions = {
  "😢": 10,
  "🥰": 10,
  "🤩": 10,
  "🤣": 10,
  "🤷": 10,
  "🤑": 10,
  "🧭": 10,
  "❤️‍🔥": 10,
  "♥️": 10,
  "⌛️": 10,
  "🎃": 10,
  "🩵": 10,
  "🪆": 10
};

let channelLink = localStorage.getItem("channelLink") || "";
let posts = JSON.parse(localStorage.getItem("posts") || "[]");

document.addEventListener("DOMContentLoaded", () => {
  loadChannel();
  loadReactions();
  loadPosts();
  updateStats();

  const verifyBtn = document.getElementById("verifyChannel");
  if (verifyBtn) {
    verifyBtn.addEventListener("click", verifyChannel);
  }

  const prepareBtn = document.getElementById("prepareReactions");
  if (prepareBtn) {
    prepareBtn.addEventListener("click", prepareReactions);
  }
});

function loadChannel() {
  const input = document.getElementById("channelLink");

  if (input && channelLink) {
    input.value = channelLink;
  }
}

function saveChannel() {
  const input = document.getElementById("channelLink");

  if (!input) {
    showLog("Channel link input not found.", "error");
    return "";
  }

  const value = input.value.trim();

  if (!value) {
    showLog("Please enter a WhatsApp Channel link.", "error");
    return "";
  }

  if (!value.startsWith("https://whatsapp.com/channel/")) {
    showLog("Invalid WhatsApp Channel link.", "error");
    return "";
  }

  channelLink = value;
  localStorage.setItem("channelLink", channelLink);

  return channelLink;
}

async function verifyChannel() {
  const link = saveChannel();

  if (!link) return;

  showLog("Connecting to backend...", "info");

  try {
    const response = await fetch(`${BACKEND_URL}/api/channel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        channelLink: link
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Channel verification failed.");
    }

    setConnectionStatus(true);

    showLog("Channel link accepted by backend.", "success");
  } catch (error) {
    setConnectionStatus(false);

    showLog(
      `Backend connection error: ${error.message}`,
      "error"
    );
  }
}

function setConnectionStatus(connected) {
  const status =
    document.getElementById("connectionStatus") ||
    document.querySelector(".status");

  if (!status) return;

  if (connected) {
    status.textContent = "Connected";
    status.classList.add("connected");
    status.classList.remove("disconnected");
  } else {
    status.textContent = "Disconnected";
    status.classList.add("disconnected");
    status.classList.remove("connected");
  }
}

function loadReactions() {
  const saved = JSON.parse(
    localStorage.getItem("reactionSettings") || "{}"
  );

  Object.keys(reactions).forEach((emoji) => {
    if (typeof saved[emoji] === "number") {
      reactions[emoji] = saved[emoji];
    }
  });

  renderReactionValues();
}

function saveReactions() {
  localStorage.setItem(
    "reactionSettings",
    JSON.stringify(reactions)
  );
}

function renderReactionValues() {
  Object.entries(reactions).forEach(([emoji, amount]) => {
    const safeEmoji = encodeURIComponent(emoji);

    const element =
      document.querySelector(`[data-reaction="${safeEmoji}"]`) ||
      document.querySelector(`[data-emoji="${emoji}"]`);

    if (element) {
      element.textContent = amount;
    }
  });
}

function changeReaction(emoji, amount) {
  if (!Object.prototype.hasOwnProperty.call(reactions, emoji)) {
    reactions[emoji] = 0;
  }

  reactions[emoji] += amount;

  if (reactions[emoji] < 0) {
    reactions[emoji] = 0;
  }

  saveReactions();
  renderReactionValues();
  updateStats();
}

async function prepareReactions() {
  const link = saveChannel();

  if (!link) return;

  showLog("Sending reaction configuration to backend...", "info");

  try {
    const response = await fetch(`${BACKEND_URL}/api/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        channelLink: link,
        reactions: reactions
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Could not prepare reactions."
      );
    }

    showLog(
      "Reaction configuration successfully sent to backend.",
      "success"
    );

    addActivity(
      "Reaction configuration prepared"
    );
  } catch (error) {
    showLog(
      `Backend error: ${error.message}`,
      "error"
    );
  }
}

function addActivity(message) {
  const activity =
    document.getElementById("activityLog") ||
    document.querySelector(".activity-log");

  if (!activity) return;

  const item = document.createElement("div");

  item.className = "activity-item";

  item.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <small>${new Date().toLocaleTimeString()}</small>
  `;

  activity.prepend(item);
}

function showLog(message, type = "info") {
  console.log(`[${type}] ${message}`);

  const log =
    document.getElementById("activityLog") ||
    document.querySelector(".activity-log");

  if (!log) return;

  const item = document.createElement("div");

  item.className = `activity-item ${type}`;

  item.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <small>${new Date().toLocaleTimeString()}</small>
  `;

  log.prepend(item);
}

function loadPosts() {
  const container =
    document.getElementById("posts") ||
    document.querySelector(".posts");

  if (!container) return;

  if (!posts.length) {
    return;
  }

  container.innerHTML = "";

  posts.forEach((post) => {
    const item = document.createElement("div");

    item.className = "post";

    item.innerHTML = `
      <div class="post-content">
        <strong>${escapeHtml(post.title || "Channel Post")}</strong>
        <p>${escapeHtml(post.text || "")}</p>
      </div>
    `;

    container.appendChild(item);
  });
}

function savePosts() {
  localStorage.setItem(
    "posts",
    JSON.stringify(posts)
  );
}

function addPost(title, text) {
  posts.unshift({
    title: title || "Channel Post",
    text: text || "",
    createdAt: Date.now()
  });

  savePosts();
  loadPosts();
  updateStats();
}

function updateStats() {
  const totalReactions = Object.values(reactions)
    .reduce((sum, value) => sum + Number(value || 0), 0);

  const totalElement =
    document.getElementById("totalReactions");

  if (totalElement) {
    totalElement.textContent =
      totalReactions.toLocaleString();
  }

  const postsElement =
    document.getElementById("totalPosts");

  if (postsElement) {
    postsElement.textContent =
      posts.length.toLocaleString();
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.changeReaction = changeReaction;
window.verifyChannel = verifyChannel;
window.prepareReactions = prepareReactions;
window.addPost = addPost;
