const BACKEND_URL =
  "https://channel-reaction-backend.onrender.com";

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

const channelInput =
  document.getElementById("channelLink");

const statusText =
  document.getElementById("statusText");

const statusDot =
  document.getElementById("statusDot");

const channelResult =
  document.getElementById("channelResult");

const botStatus =
  document.getElementById("botStatus");

const postsContainer =
  document.getElementById("posts");

const postCount =
  document.getElementById("postCount");

const reactionCount =
  document.getElementById("reactionCount");

const totalCount =
  document.getElementById("totalCount");

const log =
  document.getElementById("log");


function addLog(message) {
  if (!log) return;

  const item = document.createElement("div");

  item.textContent =
    `${new Date().toLocaleTimeString()} — ${message}`;

  log.prepend(item);
}


function setConnection(connected) {
  if (!statusText) return;

  if (connected) {
    statusText.textContent = "Connected";

    if (statusDot) {
      statusDot.classList.add("connected");
    }

    addLog("Backend connected successfully ✅");

  } else {
    statusText.textContent = "Not connected";

    if (statusDot) {
      statusDot.classList.remove("connected");
    }
  }
}


async function verifyChannel() {

  const link = channelInput
    ? channelInput.value.trim()
    : "";

  if (!link) {

    if (channelResult) {
      channelResult.textContent =
        "Mete WhatsApp Channel link la.";
    }

    return;
  }


  if (
    !link.startsWith(
      "https://whatsapp.com/channel/"
    )
  ) {

    if (channelResult) {
      channelResult.textContent =
        "Channel link la pa valid.";
    }

    setConnection(false);

    return;
  }


  if (channelResult) {
    channelResult.textContent =
      "Ap verify Channel la...";
  }

  if (botStatus) {
    botStatus.textContent =
      "Connecting to backend...";
  }


  try {

    const response = await fetch(
      `${BACKEND_URL}/api/channel`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          channelLink: link
        })
      }
    );


    const data =
      await response.json();


    console.log(
      "Backend response:",
      data
    );


    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Channel verification failed"
      );
    }


    localStorage.setItem(
      "channelLink",
      link
    );


    setConnection(true);


    if (channelResult) {
      channelResult.textContent =
        "Channel verify avèk siksè ✅";
    }


    if (botStatus) {
      botStatus.textContent =
        "Channel Ready ✅";
    }


    addLog(
      "WhatsApp Channel accepted by backend ✅"
    );


  } catch (error) {

    console.error(error);

    setConnection(false);


    if (channelResult) {
      channelResult.textContent =
        "Backend pa reponn: " +
        error.message;
    }


    if (botStatus) {
      botStatus.textContent =
        "Waiting for Channel...";
    }


    addLog(
      "Connection error ❌"
    );
  }
}


async function prepareReactions() {

  const link = channelInput
    ? channelInput.value.trim()
    : "";


  if (!link) {

    if (botStatus) {
      botStatus.textContent =
        "Verify Channel la an premye.";
    }

    return;
  }


  if (botStatus) {
    botStatus.textContent =
      "Preparing reactions...";
  }


  try {

    const response = await fetch(
      `${BACKEND_URL}/api/reactions`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          channelLink: link,
          reactions: reactions
        })
      }
    );


    const data =
      await response.json();


    console.log(
      "Reaction response:",
      data
    );


    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Reaction request failed"
      );
    }


    if (botStatus) {
      botStatus.textContent =
        "Reaction configuration ready ✅";
    }


    addLog(
      "Reaction configuration sent to backend ✅"
    );


  } catch (error) {

    console.error(error);


    if (botStatus) {
      botStatus.textContent =
        "Reaction request failed ❌";
    }


    addLog(
      "Reaction request failed ❌"
    );
  }
}


function clearSettings() {

  if (channelInput) {
    channelInput.value = "";
  }

  localStorage.removeItem(
    "channelLink"
  );


  setConnection(false);


  if (channelResult) {
    channelResult.textContent =
      "Pa gen Channel verifye toujou.";
  }


  if (botStatus) {
    botStatus.textContent =
      "Waiting for Channel...";
  }


  addLog(
    "Settings cleared."
  );
}


function addDemoPost() {

  if (!postsContainer) return;


  const empty =
    postsContainer.querySelector(".empty");

  if (empty) {
    empty.remove();
  }


  const post =
    document.createElement("div");

  post.className = "post";


  post.innerHTML = `
    <strong>Demo Channel Post</strong>
    <p>Demo post created from dashboard.</p>
  `;


  postsContainer.prepend(post);


  updateStats();


  addLog(
    "Demo post added."
  );
}


function updateStats() {

  if (postCount && postsContainer) {

    const posts =
      postsContainer.querySelectorAll(
        ".post"
      ).length;

    postCount.textContent =
      posts;
  }


  if (reactionCount) {

    reactionCount.textContent =
      Object.keys(reactions).length;
  }


  if (totalCount) {

    const total =
      Object.values(reactions)
        .reduce(
          (sum, value) =>
            sum + Number(value),
          0
        );

    totalCount.textContent =
      total;
  }
}


function restoreChannel() {

  const saved =
    localStorage.getItem(
      "channelLink"
    );


  if (saved && channelInput) {

    channelInput.value =
      saved;
  }
}


restoreChannel();
updateStats();


addLog(
  "System ready 🚀"
);
