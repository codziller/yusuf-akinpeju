import { isBoolean } from "lodash";

const cleanPayload = (payload) => {
  Object.keys(payload).forEach((key) => {
    if (isBoolean(payload[key]) || payload[key] === 0) {
      return;
    }
    if (!payload[key]) {
      delete payload[key];
    }
  });
  return payload;
};
export default cleanPayload;
