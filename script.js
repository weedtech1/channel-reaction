const BACKEND_URL =
  "https://channel-reaction-backend.onrender.com";

const channelInput = document.getElementById("channelLink");
const verifyButton = document.getElementById("verifyChannel");
const prepareButton = document.getElementById("prepareReactions");

const connectionStatus =
  document.getElementById("connectionStatus") ||
  document.querySelector(".status");

const channelMessage =
  document.getElementById("channelMessage") ||
  document.querySelector(".channel-message");

const reactionStatus =
  document.getElementById("reactionStatus") ||
  document.querySelector(".reaction-status");

function setStatus(text, connected = false) {
  if (!connectionStatus) return;

  connectionStatus.textContent = text;

  connectionStatus.classList.toggle(
    "connected",
    connected
  );

  connectionStatus.classList.toggle(
    "disconnected",
    !connected
  );
}

function message(text) {
  if (channelMessage) {
    channelMessage.textContent = text;
  }

  console.log(text);
}

async function verifyChannel() {
  const channelLink = channelInput
    ? channelInput.value.trim()
    : "";

  if (!channelLink) {
    message("Mete yon WhatsApp Channel link.");
    setStatus("Not connected");
    return;
  }

  if (!channelLink.startsWith(
    "https://whatsapp.com/channel/"
  )) {
    message("WhatsApp Channel link la pa valid.");
    setStatus("Not connected");
    return;
  }

  message("Ap verify Channel la...");
  setStatus("Connecting...");

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/channel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          channelLink: channelLink
        })
      }
    );

    const data = await response.json();

    console.log("Backend response:", data);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Verification failed"
      );
    }

    localStorage.setItem(
      "channelLink",
      channelLink
    );

    setStatus("Connected", true);

    message(
      "Channel link la verify avèk siksè ✅"
    );

    if (reactionStatus) {
      reactionStatus.textContent =
        "Channel Ready ✅";
    }

  } catch (error) {
    console.error(error);

    setStatus("Not connected");

    message(
      "Backend pa reponn. Eseye ankò."
    );

    if (reactionStatus) {
      reactionStatus.textContent =
        "Waiting for Channel...";
    }
  }
}

async function prepareReactions() {
  const channelLink = channelInput
    ? channelInput.value.trim()
    : "";

  if (!channelLink) {
    message("Verify Channel la an premye.");
    return;
  }

  const reactions = {};

  document
    .querySelectorAll("[data-emoji]")
    .forEach((element) => {
      const emoji =
        element.getAttribute("data-emoji");

      const input =
        element.querySelector("input");

      if (input) {
        reactions[emoji] =
          Number(input.value) || 0;
      }
    });

  try {
    if (reactionStatus) {
      reactionStatus.textContent =
        "Preparing reactions...";
    }

    const response = await fetch(
      `${BACKEND_URL}/api/reactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          channelLink: channelLink,
          reactions: reactions
        })
      }
    );

    const data = await response.json();

    console.log("Reaction response:", data);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Reaction request failed"
      );
    }

    if (reactionStatus) {
      reactionStatus.textContent =
        "Reactions prepared ✅";
    }

    message(
      "Reaction configuration backend lan resevwa ✅"
    );

  } catch (error) {
    console.error(error);

    if (reactionStatus) {
      reactionStatus.textContent =
        "Reaction request failed";
    }

    message(
      "Backend pa resevwa demann lan."
    );
  }
}

function restoreChannel() {
  const saved =
    localStorage.getItem("channelLink");

  if (saved && channelInput) {
    channelInput.value = saved;
  }
}

if (verifyButton) {
  verifyButton.addEventListener(
    "click",
    verifyChannel
  );
}

if (prepareButton) {
  prepareButton.addEventListener(
    "click",
    prepareReactions
  );
}

restoreChannel();

console.log(
  "Channel Reaction frontend loaded 🚀"
);
