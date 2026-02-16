// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function splitByGPA(students, minGpa) {
  const highGPAList = [];
  const lowGPAList = [];
  const threshold = Number(minGpa);

  students.forEach((s) => {
    const gpa = typeof s.GPA === "number" ? s.GPA : Number(s.GPA ?? 0);
    if (!isNaN(threshold) && gpa >= threshold) highGPAList.push(s);
    else lowGPAList.push(s);
  });

  return { highGPAList, lowGPAList };
}

function calculateGroupCount(totalStudents, maxSize) {
  const max = Math.max(1, Number(maxSize) || 1);
  return Math.max(1, Math.ceil(totalStudents / max));
}

function initGroups(groupCount) {
  return Array.from({ length: groupCount }, (_, i) => ({
    groupName: `Group ${i + 1}`,
    members: [],
    topicId: null,
    topicName: null,
  }));
}

function roundRobinAssign(items, groups) {
  let idx = 0;
  items.forEach((item) => {
    groups[idx % groups.length].members.push(item);
    idx++;
  });
}

function enforceMaxSize(groups, maxSize) {
  const max = Number(maxSize) || Infinity;
  if (!isFinite(max)) return;

  let changed = true;
  while (changed) {
    changed = false;
    const over = groups.find((g) => g.members.length > max);
    if (!over) break;

    const smallest = groups.reduce((a, b) =>
      a.members.length <= b.members.length ? a : b
    );

    if (over && smallest && over !== smallest) {
      const moved = over.members.pop();
      smallest.members.push(moved);
      changed = true;
    }
  }
}

function ensureMinSize(groups, minSize) {
  const min = Number(minSize) || 1;
  if (min <= 1) return;

  let changed = true;
  while (changed) {
    changed = false;
    const under = groups.find((g) => g.members.length < min);
    const over = groups.find((g) => g.members.length > min);
    if (under && over) {
      const moved = over.members.pop();
      under.members.push(moved);
      changed = true;
    }
  }
}

// Normalize helpers (case-insensitive)
function normGender(s) {
  const v = String(s || "").trim().toLowerCase();
  if (v === "male") return "Male";
  if (v === "female") return "Female";
  return "Unknown";
}
function normReligion(s) {
  const v = String(s || "").trim().toLowerCase();
  if (v === "buddhism") return "Buddhism";
  if (v === "tamil") return "Tamil";
  if (v === "christianity") return "Christianity";
  if (v === "muslim") return "Muslim";
  return "Unknown";
}

// Count utilities
function countBy(arr, keyFn) {
  return arr.reduce((acc, x) => {
    const k = keyFn(x);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

// ──────────────────────────────────────────────────────────────────────────────
// Soft-balancing assignment (gender/religion) after GPA distribution
// ──────────────────────────────────────────────────────────────────────────────

// Compute cohort ratios for gender/religion (used as proportional targets)
function computeCohortRatios(students) {
  const total = students.length || 1;
  const gCounts = countBy(students, (s) => normGender(s.gender));
  const rCounts = countBy(students, (s) => normReligion(s.religion));

  const genderRatios = {};
  for (const k of Object.keys(gCounts)) genderRatios[k] = gCounts[k] / total;

  const religionRatios = {};
  for (const k of Object.keys(rCounts)) religionRatios[k] = rCounts[k] / total;

  return { genderRatios, religionRatios };
}

// Current group composition snapshot for scoring
function groupComp(group) {
  const gCounts = countBy(group.members, (m) => normGender(m.gender));
  const rCounts = countBy(group.members, (m) => normReligion(m.religion));
  return { gCounts, rCounts, size: group.members.length };
}

// Score how much adding "student" improves group’s deviation vs proportional targets
function improvementScore(group, student, ratios, weights) {
  const { genderRatios, religionRatios } = ratios;
  const { gWeight, rWeight } = weights; // e.g., 0.5 / 0.5 if both ON

  const sizeNow = group.members.length;
  const sizeNext = sizeNow + 1;

  // gender score
  let genderScore = 0;
  if (gWeight > 0) {
    const currGender = countBy(group.members, (m) => normGender(m.gender));
    const targetF = (genderRatios["Female"] || 0) * sizeNext;
    const targetM = (genderRatios["Male"] || 0) * sizeNext;

    const nextGender = { ...currGender };
    const gk = normGender(student.gender);
    nextGender[gk] = (nextGender[gk] || 0) + 1;

    const devNow =
      Math.abs((currGender["Female"] || 0) - (genderRatios["Female"] || 0) * sizeNow) +
      Math.abs((currGender["Male"] || 0) - (genderRatios["Male"] || 0) * sizeNow);

    const devNext =
      Math.abs((nextGender["Female"] || 0) - targetF) +
      Math.abs((nextGender["Male"] || 0) - targetM);

    genderScore = devNow - devNext; // positive is good (improvement)
  }

  // religion score
  let religionScore = 0;
  if (rWeight > 0) {
    const currRel = countBy(group.members, (m) => normReligion(m.religion));
    const nextRel = { ...currRel };
    const rk = normReligion(student.religion);
    nextRel[rk] = (nextRel[rk] || 0) + 1;

    // sum absolute deviations across known religions
    const keys = ["Buddhism", "Tamil", "Christianity", "Muslim"];
    const devNow = keys.reduce((sum, k) => {
      const target = (religionRatios[k] || 0) * sizeNow;
      return sum + Math.abs((currRel[k] || 0) - target);
    }, 0);
    const devNext = keys.reduce((sum, k) => {
      const target = (religionRatios[k] || 0) * sizeNext;
      return sum + Math.abs((nextRel[k] || 0) - target);
    }, 0);

    religionScore = devNow - devNext;
  }

  return gWeight * genderScore + rWeight * religionScore;
}

// Greedy fill with soft-balancing
function fillWithSoftBalancing(groups, pool, minSize, maxSize, balanceFlags, ratios) {
  const max = Number(maxSize) || Infinity;
  const min = Number(minSize) || 1;

  const bothOn = balanceFlags.gender && balanceFlags.religion;
  const weights = {
    gWeight: balanceFlags.gender ? (bothOn ? 0.5 : 1.0) : 0.0,
    rWeight: balanceFlags.religion ? (bothOn ? 0.5 : 1.0) : 0.0,
  };

  const remaining = [...pool];

  // Keep placing until pool is empty
  while (remaining.length) {
    // Always pick the smallest group first (helps reach min, then balance sizes)
    const targetGroup = groups.reduce((a, b) =>
      a.members.length <= b.members.length ? a : b
    );
    if (!targetGroup) break;

    // If target group already at max, try next smallest that isn't at max
    let grp = targetGroup;
    const sorted = [...groups].sort((a, b) => a.members.length - b.members.length);
    for (const g of sorted) {
      if (g.members.length < max) {
        grp = g;
        break;
      }
    }
    if (grp.members.length >= max) {
      // All at max -> stop
      break;
    }

    // Choose candidate that best improves balance (fallback: first)
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];
      const score = improvementScore(grp, cand, ratios, weights);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    const chosen = remaining.splice(bestIdx, 1)[0];
    grp.members.push(chosen);
  }

  // Size post-fix
  enforceMaxSize(groups, max);
  ensureMinSize(groups, min);
  return groups;
}

// Topic assignment (unchanged)
function assignTopics(groups, topics, topicStrategy) {
  if (!Array.isArray(topics) || !topics.length) return groups;

  const list = [...topics];
  if (topicStrategy === "random") {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }

  if (topicStrategy === "sequential" || topicStrategy === "random") {
    groups.forEach((g, i) => {
      const topic = list[i % list.length];
      if (topic) {
        g.topicId = topic.topicId;
        g.topicName = topic.name;
      }
    });
  }
  return groups;
}

function summarize(groups, rules, cohort, topics, topicStrategy) {
  const totalGroups = groups.length;
  const sizes = groups.map((g) => g.members.length);
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  const avg = sizes.reduce((a, b) => a + b, 0) / (sizes.length || 1);

  // OPTIONAL: quick balance snapshot
  const genderMix = groups.map((g) => {
    const c = countBy(g.members, (m) => normGender(m.gender));
    return { Male: c.Male || 0, Female: c.Female || 0 };
  });
  const religionMix = groups.map((g) => {
    const c = countBy(g.members, (m) => normReligion(m.religion));
    return {
      Buddhism: c.Buddhism || 0,
      Tamil: c.Tamil || 0,
      Christianity: c.Christianity || 0,
      Muslim: c.Muslim || 0,
    };
  });

  return {
    year: cohort.year,
    semester: cohort.semester,
    moduleCode: cohort.moduleCode || "",
    totalGroups,
    sizeRange: { min, max, avg: Number(avg.toFixed(2)) },
    rules,
    topicStrategy,
    topicsAvailable: topics?.length || 0,
    balancePreview: {
      genderMix,
      religionMix,
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Public: buildDraft
// ─────────────────────────────────────────────────────────────────────────────-
function buildDraft({ year, semester, moduleCode = "", students, topics, rules }) {
  const {
    minSize,
    maxSize,
    gpaRule,
    strategy = "sequential",
    topicStrategy = "none",
    balance = { gender: false, religion: false }, // NEW
  } = rules || {};

  const total = Array.isArray(students) ? students.length : 0;
  const groupCount = calculateGroupCount(total, maxSize);
  const groups = initGroups(groupCount);

  const useGPA =
    gpaRule &&
    typeof gpaRule.minGpa !== "undefined" &&
    gpaRule.minGpa !== null &&
    (Number(gpaRule.count) || 0) > 0;

  let unassigned = [];

  if (useGPA) {
    // Stage 1: seed groups with required high-GPA students (hard rule)
    const { highGPAList, lowGPAList } = splitByGPA(students, Number(gpaRule.minGpa));

    const needHigh = Math.max(0, Number(gpaRule.count) || 0);
    const poolHigh = [...highGPAList];

    if (needHigh > 0 && poolHigh.length) {
      for (let round = 0; round < needHigh; round++) {
        for (let g = 0; g < groups.length && poolHigh.length; g++) {
          groups[g].members.push(poolHigh.shift());
        }
      }
      // leftover high GPA (if any) go back to unassigned pool
      unassigned.push(...poolHigh);
    }

    // everyone else (low GPA + leftover high GPA) goes to unassigned pool
    unassigned.push(...lowGPAList);
  } else {
    // no GPA rule → all students are unassigned initially
    unassigned = [...students];
  }

  // Stage 2: fill remaining seats with optional soft balancing
  if (balance.gender || balance.religion) {
    const ratios = computeCohortRatios(students);
    fillWithSoftBalancing(groups, unassigned, minSize, maxSize, balance, ratios);
  } else {
    // simple fill (old behavior)
    roundRobinAssign(unassigned, groups);
    enforceMaxSize(groups, maxSize);
    ensureMinSize(groups, minSize);
  }

  // Stage 3: assign topics
  assignTopics(groups, topics, topicStrategy);

  // Attach cohort metadata
  const draftGroups = groups.map((g) => ({
    ...g,
    year: Number(year),
    semester: Number(semester),
    moduleCode: String(moduleCode || ""),
  }));

  const summary = summarize(
    draftGroups,
    { minSize, maxSize, gpaRule, strategy, balance },
    { year, semester, moduleCode },
    topics,
    topicStrategy
  );

  return { draftGroups, summary };
}

module.exports = {
  buildDraft,
};
