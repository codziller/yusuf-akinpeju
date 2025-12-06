import moment from "moment";
const getDaysInMonth = ({ month, isSelect }) => {
  const daysArr = month
    ? Array.from(
        {
          length: moment().month(month).daysInMonth(),
        },
        (x, i) => moment().startOf("month").add(i, "days").format("DD")
      )
    : [];
  return isSelect
    ? daysArr.map((item) => {
        return { label: item, value: item };
      })
    : daysArr;
};

export { getDaysInMonth };
