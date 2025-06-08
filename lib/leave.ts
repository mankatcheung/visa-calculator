import { differenceInCalendarDays } from 'date-fns';

export const getTotalLeaveDays = (
  leaves: { startDate: Date; endDate: Date }[]
) => {
  let result = 0;
  for (let i = 0; i < leaves.length; i++) {
    const { startDate, endDate } = leaves[i];
    result += differenceInCalendarDays(endDate, startDate) + 1;
  }
  return result;
};

export const getLeaveDaysSince = (
  leaves: { startDate: Date; endDate: Date }[],
  beforeDays: number
) => {
  const upperLimitDate = new Date();
  upperLimitDate.setDate(upperLimitDate.getDate() - beforeDays);
  let result = 0;
  for (let i = 0; i < leaves.length; i++) {
    const { startDate, endDate } = leaves[i];
    if (endDate < upperLimitDate) continue;
    if (upperLimitDate < startDate) {
      result += getTotalLeaveDays([leaves[i]]);
      continue;
    }
    result += getTotalLeaveDays([
      {
        startDate: upperLimitDate,
        endDate: leaves[i].endDate,
      },
    ]);
  }
  return result;
};
