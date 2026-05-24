export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const isDateOverdue = (
  dueDate: string | Date,
  referenceDate = new Date(),
) => {
  return new Date(dueDate).getTime() < referenceDate.getTime();
};

export const toISODate = (date: Date) => date.toISOString().slice(0, 10);
