exports.makeGroupId = (year, semester, index) =>
  `Y${year}S${semester}-${String(index).padStart(3, "0")}`;
