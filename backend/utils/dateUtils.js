export const toDayStart = (input) => {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const isPastDate = (input) => {
  const target = toDayStart(input);
  const today = toDayStart(new Date());
  return target < today;
};

export const countWorkingDays = (fromDate, toDate) => {
  const start = toDayStart(fromDate);
  const end = toDayStart(toDate);

  if (end < start) return 0;

  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
};
