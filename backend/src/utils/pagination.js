function buildCursorFilter(cursor) {
  if (!cursor) return {};
  return { _id: { $gt: cursor } };
}

module.exports = { buildCursorFilter };
