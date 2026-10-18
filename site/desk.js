(function () {
  var PHONE = "628-999-3912";
  var TEL = "tel:6289993912";
  var role = null;
  var turns = [];

  var openBtn = document.getElementById("desk-open");
  var panel = document.getElementById("desk");
  var closeBtn = document.getElementById("desk-close");
  var log = document.getElementById("desk-log");
  var chips = document.getElementById("desk-chips");
  var form = document.getElementById("desk-form");
  var input = document.getElementById("desk-input");
  var title = document.getElementById("desk-title");
  var kicker = document.getElementById("desk-kicker");

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function linkPhone(html) {
    return html.split(PHONE).join('<a href="' + TEL + '">' + PHONE + "</a>");
  }

  function add(kind, html) {
    var item = document.createElement("div");
    item.className = "desk-msg " + (kind === "out" ? "desk-out" : "desk-in");
    var p = document.createElement("p");
    p.innerHTML = html;
    item.appendChild(p);
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
    return item;
  }

  function setChips(items) {
    chips.replaceChildren();
    items.forEach(function (label) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", function () {
        ask(label);
      });
      chips.appendChild(button);
    });
  }

  function setRole(next) {
    role = next;
    if (next === "resident") {
      kicker.textContent = "Residents";
      title.textContent = "The door guy";
      setChips(["Mailbox move", "Package", "Maintenance", "What's good tomorrow?"]);
      return;
    }
    if (next === "prospect") {
      kicker.textContent = "Looking";
      title.textContent = "The door guy";
      setChips(["How far?", "What's here", "Anything open?", "Tomorrow, 40s"]);
      return;
    }
    kicker.textContent = "Oakland 94609";
    title.textContent = "The door guy";
    setChips(["Tomorrow, 40s", "Cheap and close", "Rainy day", "I live here"]);
  }

  function show(bubble, text) {
    bubble.classList.remove("desk-pending");
    bubble.querySelector("p").innerHTML = linkPhone(escapeHtml(text));
    log.scrollTop = log.scrollHeight;
  }

  function ask(text) {
    var trimmed = text.trim();
    if (!trimmed || !window.DoorGuy || !DoorGuy.ready) return;
    add("out", escapeHtml(trimmed));
    var prior = turns.slice(-4);
    turns.push({ role: "user", content: trimmed });
    DoorGuy.ready.then(function (engine) {
      var result = engine.answer(trimmed, new Date());
      if (result.role) setRole(result.role);
      if (!result.callModel) {
        add("in", linkPhone(escapeHtml(result.text)));
        turns.push({ role: "assistant", content: result.text });
        return;
      }
      var bubble = add("in", "One second.");
      bubble.classList.add("desk-pending");
      fetch("/api/door-guy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: prior }),
      }).then(function (res) {
        if (!res.ok) throw new Error("book");
        return res.json();
      }).then(function (data) {
        var reply = data && data.reply ? data.reply : result.text;
        show(bubble, reply);
        turns.push({ role: "assistant", content: reply });
      }).catch(function () {
        show(bubble, result.text);
        turns.push({ role: "assistant", content: result.text });
      });
    }).catch(function () {
      add("in", linkPhone(escapeHtml("The neighborhood book didn't load. Call " + PHONE + ".")));
    });
  }

  openBtn.addEventListener("click", function () {
    panel.hidden = false;
    openBtn.hidden = true;
    input.focus();
  });

  closeBtn.addEventListener("click", function () {
    panel.hidden = true;
    openBtn.hidden = false;
    openBtn.focus();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    ask(input.value);
    input.value = "";
  });

  setRole(role);
  add("in", "I'm the door guy for 3875 Ruby. Ask what's good tomorrow around 94609. Forty-somethings, cheap eats, a rainy day. I won't guess a rent.");
})();
