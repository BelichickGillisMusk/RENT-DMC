(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.DoorGuy = api;
})(typeof window !== "undefined" ? window : this, function () {
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function compile(list) {
    return (list || []).map(function (source) {
      return new RegExp(source, "i");
    });
  }

  function hit(regexes, q) {
    for (var i = 0; i < regexes.length; i++) {
      if (regexes[i].test(q)) return true;
    }
    return false;
  }

  function fmt(mins) {
    var m = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60);
    var min = m % 60;
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    if (min === 0) return h12 + suffix;
    return h12 + ":" + (min < 10 ? "0" : "") + min + suffix;
  }

  function formatRange(range) {
    var end = range[1] >= 1440 ? range[1] - 1440 : range[1];
    return fmt(range[0]) + " to " + fmt(end);
  }

  function isOpen(ranges, mins) {
    for (var i = 0; i < ranges.length; i++) {
      var start = ranges[i][0];
      var end = ranges[i][1];
      if (end >= 1440) {
        if (mins >= start || mins < end - 1440) return true;
      } else if (mins >= start && mins < end) {
        return true;
      }
    }
    return false;
  }

  function keywordHit(q, keyword) {
    if (keyword.indexOf(" ") !== -1) return q.indexOf(keyword) !== -1;
    return new RegExp("\\b" + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(q);
  }

  function oaklandParts(date) {
    var bag = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).forEach(function (part) {
      bag[part.type] = part.value;
    });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var hour = parseInt(bag.hour, 10);
    if (hour === 24) hour = 0;
    var minute = parseInt(bag.minute, 10);
    return { weekday: days[bag.weekday], minutes: hour * 60 + minute };
  }

  function create(facts) {
    var match = {};
    Object.keys(facts.match).forEach(function (key) {
      match[key] = compile(facts.match[key]);
    });
    var byId = {};
    facts.places.forEach(function (place) {
      byId[place.id] = place;
    });

    function hoursFor(place, day) {
      if (!place || !place.hours) return [];
      return place.hours[String(day)] || [];
    }

    function hoursSentence(place, day, parts, target) {
      var ranges = hoursFor(place, day);
      if (!ranges.length) return place.name + ", " + place.where + ", is closed that day";
      var windows = ranges.map(formatRange).join(" and ");
      var sameDay = target && target.word !== "Tomorrow" && target.day === parts.weekday;
      if (sameDay && !isOpen(ranges, parts.minutes)) {
        var ended = ranges.every(function (range) {
          return range[1] < 1440 && parts.minutes >= range[1];
        });
        if (ended) return place.name + ", " + place.where + ", is already closed tonight. It was open " + windows;
      }
      return place.name + ", " + place.where + ", is open " + windows;
    }

    function callModel(q) {
      if (hit(match.emergency, q) || hit(match.mailbox, q) || hit(match.package, q) || hit(match.maintenance, q) || hit(match.portal, q)) {
        return false;
      }
      var night = hit(match.night, q);
      if (hit(match.rent, q) && !night) return false;
      if (hit(match.orientation, q) && !night) return false;
      if ((hit(match.resident, q) || hit(match.prospect, q)) && !night) return false;
      return true;
    }

    function targetDay(q, parts) {
      for (var i = 0; i < DAYS.length; i++) {
        if (q.indexOf(DAYS[i].toLowerCase()) !== -1) {
          return { day: i, word: DAYS[i], named: true };
        }
      }
      if (q.indexOf("tomorrow") !== -1) {
        return { day: (parts.weekday + 1) % 7, word: "Tomorrow", named: false };
      }
      if (q.indexOf("tonight") !== -1) {
        return { day: parts.weekday, word: "Tonight", named: false, evening: true };
      }
      return {
        day: parts.weekday,
        word: "Today",
        named: false,
        evening: parts.minutes >= 16 * 60,
      };
    }

    function whenLine(target) {
      if (target.named) return target.word + ".";
      return target.word + " is " + DAYS[target.day] + ".";
    }

    var alleyNight = [
      "The room for people in their 40s is The Alley, 3325 Grand Ave. Sunday piano bar from 5:30pm, karaoke after 8:30. Doors till 2am. Short ride from Ruby, not a walk.",
      "Monday stays quiet. The Alley on Grand Ave opens at 6pm, piano after 8, doors till 2am. Short ride, not a club.",
      "Tuesday is trivia at The Alley, 7 to 9pm, teams up to 6. You can show up alone. Doors at 6pm, 3325 Grand Ave, a short ride from Ruby.",
      "Wednesday is the guitar bar at The Alley after 8, doors at 6pm. 3325 Grand Ave, a short ride, not a walk.",
      "Thursday piano at The Alley starts at 8pm. Doors at 6pm. 3325 Grand Ave, a short ride from the lobby.",
      "Friday piano at The Alley starts at 9pm. Eat in Temescal first if you want dinner. Doors at 6pm, 3325 Grand Ave.",
      "Saturday piano at The Alley starts at 9pm. Doors at 6pm, till 2am. 3325 Grand Ave, a short ride, not a walk.",
    ];

    function moods(q) {
      return {
        rain: /rain|wet|storm|umbrella/.test(q),
        cheap: /cheap|budget|broke|inexpensive|\bdeal\b/.test(q),
        grown: /40s|40's|forties|singles|\bdate\b|my age|not a club/.test(q),
        dog: /\bdogs?\b|\bpup\b/.test(q),
        kid: /\bkids?\b|\bfamily\b|\bchildren\b/.test(q),
      };
    }

    function grown(day, line, rain, parts, target) {
      var outdoor = rain ? "Stay inside." : "If it's dry, Mosswood is the free afternoon.";
      var backup = "Stay in Temescal if you want it cheaper: " + hoursSentence(byId.brewing, day, parts, target) + ". " + byId.brewing.blurb;
      return [line, outdoor, alleyNight[day], backup].join(" ");
    }

    function cheap(day, line, rain, parts, target) {
      var bits = [line];
      if (rain) bits.push("Skip the park.");
      bits.push(hoursSentence(byId.betty, day, parts, target) + ". " + byId.betty.blurb);
      bits.push(hoursSentence(byId.winky, day, parts, target) + ". " + byId.winky.blurb);
      bits.push(hoursSentence(byId.brewing, day, parts, target) + ". " + byId.brewing.blurb);
      bits.push("The Alley is a ride and a bar tab.");
      return bits.join(" ");
    }

    function general(day, line, evening, rain, parts, target) {
      var bits = [line];
      if (rain) bits.push("Stay inside.");
      if (!evening && !rain && hoursFor(byId.betty, day).length) {
        bits.push(hoursSentence(byId.betty, day, parts, target) + ". " + byId.betty.blurb);
      }
      if (!rain && !evening) bits.push("Mosswood is free if it's dry.");
      bits.push(hoursSentence(byId.brewing, day, parts, target) + ". " + byId.brewing.blurb);
      bits.push(alleyNight[day]);
      return bits.join(" ");
    }

    function family(line) {
      return line + " Mosswood Park has the playground. Then Fentons Creamery, 4226 Piedmont Ave, for ice cream. " + byId.fentons.hoursNote + " I wouldn't send a kid to The Alley.";
    }

    function dog(day, line, parts, target) {
      return line + " Mosswood is the walk. I don't know which patios allow dogs, so ask before you tie one up. " + hoursSentence(byId.brewing, day, parts, target) + ". " + byId.ace.blurb + " Ace is " + (hoursFor(byId.ace, day).length ? "open " + hoursFor(byId.ace, day).map(formatRange).join(" and ") : "closed that day") + ".";
    }

    function specific(q, day, line, parts, target) {
      var hits = facts.places.filter(function (place) {
        return (place.keywords || []).some(function (keyword) {
          return keywordHit(q, keyword);
        });
      });
      if (!hits.length) return "";
      var sentences = hits.slice(0, 2).map(function (place) {
        if (place.always) return place.name + ". " + place.blurb;
        if (!place.hours) return place.name + ", " + place.where + ". " + place.blurb + " " + (place.hoursNote || "");
        var sentence = hoursSentence(place, day, parts, target) + ". " + place.blurb;
        if (place.id === "alley") sentence += " " + alleyNight[day];
        return sentence;
      });
      return line + " " + sentences.join(" ");
    }

    function openNow(parts) {
      var day = parts.weekday;
      var mins = parts.minutes;
      var open = facts.places.filter(function (place) {
        return place.hours && isOpen(hoursFor(place, day), mins);
      });
      if (!open.length) {
        return "Nothing in the book is open at " + fmt(mins) + " on " + DAYS[day] + ". Walk Mosswood if you just need air, or wait for Temescal Brewing's next shift. Call " + facts.phone + " for the building.";
      }
      var names = open.map(function (place) {
        return place.name;
      }).join(", ");
      return "Open at " + fmt(mins) + " on " + DAYS[day] + ": " + names + ". Hours move, so glance before you walk.";
    }

    function unknownFood(q, day, line, parts, target) {
      if (!/pizza|burrito|taco|sushi|thai|coffee|breakfast|brunch|burger|noodles|bbq|cocktail/.test(q)) return "";
      return line + " I won't crown a best one. That dish isn't in the book. Close and cheap is Winky Dinky Dogs or Temescal Brewing. " + hoursSentence(byId.winky, day, parts, target) + ". " + hoursSentence(byId.brewing, day, parts, target) + ".";
    }

    function plan(q, parts) {
      var target = targetDay(q, parts);
      var line = whenLine(target);
      var mood = moods(q);
      if (/open now|what's open|whats open|right now|still open/.test(q)) return openNow(parts);
      var named = specific(q, target.day, line, parts, target);
      if (named && !mood.grown && !mood.cheap && !mood.rain) return named;
      if (mood.kid) return family(line);
      if (mood.dog) return dog(target.day, line, parts, target);
      if (mood.cheap) return cheap(target.day, line, mood.rain, parts, target);
      if (mood.grown) return grown(target.day, line, mood.rain, parts, target);
      if (named) return named;
      if (hit(match.night, q) || mood.rain) return general(target.day, line, target.evening, mood.rain, parts, target);
      var food = unknownFood(q, target.day, line, parts, target);
      if (food) return food;
      return "That's outside the block. I know 94609, the walk to BART, and what's good tomorrow. For the building, call " + facts.phone + ".";
    }

    function answer(text, now) {
      var q = String(text || "").toLowerCase().replace(/’/g, "'").trim();
      var phone = facts.phone;
      var base = { role: null, callModel: callModel(q) };
      if (!q) {
        return Object.assign(base, { lane: "building", callModel: false, text: "Ask me what's good around 94609, or something about the building." });
      }
      if (hit(match.emergency, q)) {
        return Object.assign(base, { lane: "building", callModel: false, text: "Call " + phone + " now. If someone is hurt or you smell gas, call 911 first. Don't wait on email." });
      }
      if (hit(match.mailbox, q)) {
        return Object.assign(base, { lane: "building", callModel: false, text: "The building mailboxes are moving. Amazon Hub lockers stay on site. Don't file a change of address, and don't ship to a guessed box, until the desk confirms the new drop. Call or text " + phone + "." });
      }
      if (hit(match.package, q)) {
        return Object.assign(base, { lane: "building", callModel: false, text: "Amazon Hub lockers are still on site. Those are separate from the mailboxes that are moving. If a package is missing, call or text " + phone + "." });
      }
      if (hit(match.maintenance, q)) {
        return Object.assign(base, { lane: "building", callModel: false, text: "Maintenance is on site. Tell me the unit and what's wrong, or just call " + phone + ". If water is spreading, you have no heat, or it isn't safe, call. Don't email an emergency." });
      }
      if (hit(match.portal, q)) {
        return Object.assign(base, { lane: "building", callModel: false, text: "Rent isn't paid in this chat, and there isn't a resident login yet. Call or text " + phone + ", or email " + facts.email + "." });
      }
      var night = hit(match.night, q);
      if (hit(match.rent, q) && !night) {
        return Object.assign(base, { lane: "building", callModel: false, text: "I won't guess a rent or say a unit is open. Call or text " + phone + " and ask what's actually available. Email is " + facts.email + "." });
      }
      if (hit(match.orientation, q) && !night) {
        if (/laundry|bike|parking|pet|amenit|what's here|whats here/.test(q)) {
          return Object.assign(base, { lane: "building", callModel: false, text: "On site: laundry, indoor bike storage, a back patio with a grill and patio set, and free street parking. The building is pet friendly. Maintenance is on site, and it's locally owned. 24 units at 3875 Ruby St." });
        }
        return Object.assign(base, { lane: "building", callModel: false, text: "Walk Score 94, Transit Score 88. MacArthur BART is about a 10 minute walk. Kaiser and Alta Bates Summit are about a 10 minute walk. CA-24, I-580, and I-980 are about a 2 to 3 minute drive. Temescal and Piedmont Ave are about a 10 to 15 minute walk. Uptown is about 7 minutes by car or one BART stop. UC Berkeley is about 15 minutes by BART or car. I don't have live vacancies or prices in this chat." });
      }
      if (hit(match.resident, q) && !night) {
        return Object.assign(base, { lane: "building", role: "resident", callModel: false, text: "You're with the door guy. Mailboxes are moving, Amazon Hub lockers are still on site, and anything unsafe is a phone call, not a message. What do you need?" });
      }
      if (hit(match.prospect, q) && !night) {
        return Object.assign(base, { lane: "building", role: "prospect", callModel: false, text: "I'll treat this like a showing. Walk Score is 94 and Transit Score is 88. Care, the park, and MacArthur BART are about a 10 minute walk. I don't have live vacancies or prices in this chat." });
      }
      return Object.assign(base, { lane: "neighborhood", text: plan(q, oaklandParts(now || new Date())) });
    }

    return { answer: answer, oaklandParts: oaklandParts };
  }

  var api = { create: create };
  if (typeof fetch === "function" && typeof window !== "undefined") {
    api.ready = fetch("/door-facts.json", { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("book");
      return res.json();
    }).then(create);
  }
  return api;
});
