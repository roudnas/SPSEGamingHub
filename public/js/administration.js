document.querySelector("#adminLink").classList.add("nav-links-selected");
document.querySelector(".live-form-game-update").style.display = "none";

loadLogs().then((logs) => {
  refreshLogs(logs);
});

$(".modal-log-detail").on("show.bs.modal", function (event) {
  let logId = $(event.relatedTarget).data("logid");
  fetch(`/api/logs/id/${logId}`)
    .then((res) => res.json())
    .then((log) => {
      const logFormatted = {
        id: log.log_id,
        userId: log.uid,
        userName: log.uname,
        message: log.log_message,
        type: log.log_type,
        timestamp: log.log_timestamp,
        ip: log.log_userip,
      };

      document.querySelector(
        ".modal-log-detail-body"
      ).innerHTML = syntaxHighlight(logFormatted);
    })
    .catch((err) => console.error(err));
});

async function loadLogs() {
  logs = await fetch("api/logs").catch((err) => {
    console.error(err);
  });
  return await logs.json();
}

function loadLogsOrderBy(order, direction = "") {
  fetch(`api/logs/filter?order=${order}&order_direction=${direction}`)
    .then((logs) => logs.json())
    .then((logs) => {
      refreshLogs(logs);
    })
    .catch((err) => {
      console.error(err);
    });
}

function refreshLogs(logs) {
  if (logs) {
    const tbody = document.querySelector(".logs-body");
    tbody.innerHTML = "";
    logs.forEach((log) => {
      const logEl = document.createElement("tr");
      setMultAttributes(logEl, {
        class: "log-row",
        "data-toggle": "modal",
        "data-target": ".modal-log-detail",
        "data-logid": log.log_id,
      });
      tbody.append(logEl);
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.innerHTML = log.log_id;
      const uidTd = document.createElement("td");
      uidTd.innerHTML = log.uid;
      const unameTd = document.createElement("td");
      unameTd.innerHTML = log.uname;
      const log_typeTd = document.createElement("td");
      log_typeTd.innerHTML = log.log_type;
      const log_timestampTd = document.createElement("td");
      log_timestampTd.innerHTML = log.log_timestamp;
      const log_useripTd = document.createElement("td");
      log_useripTd.innerHTML = log.log_userip;
      logEl.append(
        th,
        uidTd,
        unameTd,
        log_typeTd,
        log_timestampTd,
        log_useripTd
      );
    });
  } else {
    console.error("Logs not found");
  }
}

function getGameForm(value) {
  if (value)
    document.querySelector(".live-form-game-update").style.display = "block";
  else document.querySelector(".live-form-game-update").style.display = "none";
  fetch("/api/games/id/" + value)
    .then((res) => res.json())
    .then((game) => {
      document.querySelector("#game-edit-id").value = game.game_id;
      document.querySelector("#game-edit-name").value = game.game_name;
      document.querySelector("#game-edit-shortname").value =
        game.game_short_name;
      document.querySelector("#game-edit-playerlimit").value =
        game.game_playerlimitperteam;
    })
    .catch((err) => console.error(err));
}

function changeVerificationSelect(value) {
  for (
    let i = 0;
    i < document.querySelector(".user-input-group").childNodes.length;
    i++
  )
    document
      .querySelector(".user-input-group")
      .removeChild(document.querySelector(".user-input-group").childNodes[0]);
  if (value == "usr") {
    let i = document.createElement("input");
    setMultAttributes(i, {
      class: "form-control my-1 hintable",
      id: "hintable-user",
      placeholder: "Username#hexid",
      name: "verification_username",
      autocomplete: "off",
      onkeyup:
        'loadUserLiveText(this.value,"livesearch-verify","hint-verify", "hintable-user")',
    });
    document.querySelector(".user-input-group").append(i);
  } else if (value == "team") {
    let i = document.createElement("input");
    setMultAttributes(i, {
      class: "form-control my-1 hintable",
      id: "hintable-team",
      name: "verification_teamname",
      placeholder: "Teamname",
      onkeyup: 'loadTeamLiveText(this.value,"livesearch-verify","hint-verify")',
    });
    document.querySelector(".user-input-group").append(i);
  }
}

function syntaxHighlight(json) {
  if (typeof json != "string") {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}
