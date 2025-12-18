const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth(), // 0–11
    year: now.getFullYear()
  };
};

module.exports = {
  getCurrentMonthYear
};
