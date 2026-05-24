export const toNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return Number(value);
};

export const money = (value: number | string | null | undefined) => {
  return Number(toNumber(value).toFixed(2));
};
