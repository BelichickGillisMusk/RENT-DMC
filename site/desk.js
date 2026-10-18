(function () {
  var PHONE = "628-999-3912";
  var TEL = "tel:6289993912";
  var role = null;

  var openBtn = document.getElementById("desk-open");
  var panel = document.getElementById("desk");
  var closeBtn = document.getElementById("desk-close");
  var log = document.getElementById("desk-log");
  var chips = document.getElementById("desk-chips");
  var form = document.getElementById("desk-form");
  var input = document.getElementById("desk-input");
  var title = document.getElementById("desk-title");
  var kicker = document.getElementById("desk-kicker");

  function phoneLink() {
    return '<a href="' + TEL + '">' + PHONE + "</a>";
  }

  function add(kind, html) {
    var item = document.createElement("div");
    item.className = "desk-msg " + (kind === "out" ? "desk-out" : "desk-in");
    var p = document.createElement("p");
    p.innerHTML = html;
    item.appendChild(p);
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
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
      kicker.textContent = "Doorman";
      title.textContent = "For residents";
      setChips(["Package", "Maintenance", "Laundry", "Parking"]);
      return;
    }
    if (next === "prospect") {
      kicker.textContent = "Leasing";
      title.textContent = "Looking at Ruby";
      setChips(["How far?", "What's here", "Anything open?", "Pets"]);
      return;
    }
    kicker.textContent = "The desk";
    title.textContent = "Doorman or leasing";
    setChips(["I live here", "I'm looking"]);
  }

  function answer(text) {
    var q = text.toLowerCase();

    if (/i live here|i'm a resident|im a resident|resident|tenant|doorman/.test(q)) {
      setRole("resident");
      return "You're with the doorman. Amazon Hub lockers are on site, and anything unsafe is a phone call, not a message. What do you need?";
    }
    if (/i'm looking|im looking|looking|tour|lease|rent a|prospect|available/.test(q) && !role) {
      setRole("prospect");
      return "I'll treat this like a showing. Walk Score is 94 and Transit Score is 88. Care, the park, and MacArthur BART are about a 10 minute walk. I don't have live vacancies or prices in this chat.";
    }
    if (/emergency|gas|fire|flood|no heat|no power|leak|lockout|locked out|smell/.test(q)) {
      return "Call " + phoneLink() + " now. If someone is hurt or you smell gas, call 911 first. Don't wait on email.";
    }
    if (/mail|mailbox|usps|change of address|forward/.test(q)) {
      return "For building mail, call or text " + phoneLink() + ". Amazon Hub lockers are on site for packages.";
    }
    if (/package|amazon|locker|delivery/.test(q)) {
      return "Amazon Hub lockers are on site. If a package is missing, call or text " + phoneLink() + ".";
    }
    if (/walk|bart|kaiser|park|transit|how far|score|temescal|trader/.test(q)) {
      return "Walk Score 94, Transit Score 88. MacArthur BART is about a 10 minute walk. Kaiser and Alta Bates Summit are about a 10 minute walk. CA-24, I-580, and I-980 are about a 2 to 3 minute drive. Temescal and Piedmont Ave are about a 10 to 15 minute walk. Uptown is about 7 minutes by car or one BART stop. UC Berkeley is about 15 minutes by BART or car. I don't have live vacancies or prices in this chat.";
    }
    if (/laundry|bike|parking|pet|patio|grill|amenit/.test(q)) {
      return "On site: laundry, indoor bike storage, a back patio with a grill and patio set, and free street parking. The building is pet friendly. Maintenance is on site, and it's locally owned. 24 units at 3875 Ruby St.";
    }
    if (/price|how much|available|vacan|open unit|anything open|what'?s open|tour|apply|deposit/.test(q)) {
      return "I won't guess a rent or say a unit is open. Call or text " + phoneLink() + " and ask what's actually available. Email is hello@rent-ruby.com.";
    }
    if (/maintenance|repair|broken|toilet|faucet/.test(q)) {
      return "Maintenance is on site. Tell me the unit and what's wrong, or just call " + phoneLink() + ". If water is spreading, you have no heat, or it isn't safe, call. Don't email an emergency.";
    }
    if (/pay|rent due|ledger|portal|login|app/.test(q)) {
      return "Rent isn't paid in this chat, and there isn't a resident login yet. Call or text " + phoneLink() + ", or email hello@rent-ruby.com.";
    }
    if (!role) {
      return "Tell me which desk you need. Residents get the doorman. People looking to rent get the leasing desk.";
    }
    if (role === "resident") {
      return "I can help with packages, laundry, bikes, parking, pets, or maintenance. For anything I shouldn't guess, call " + phoneLink() + ".";
    }
    return "The short version: Walker’s paradise, excellent transit, real 1924 building, 24 units. For a price or a tour, call " + phoneLink() + ".";
  }

  function ask(text) {
    var trimmed = text.trim();
    if (!trimmed) return;
    add("out", trimmed.replace(/</g, ""));
    add("in", answer(trimmed));
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

  setRole(null);
  add("in", "I'm at the desk for 3875 Ruby. If you live here, I'll handle it like the doorman. If you're looking, I'll walk you through the building. Which one are you?");
})();
