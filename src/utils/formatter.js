import { isString } from "lodash";

export function numberWithCommas(x) {
  if (x) {
    const splitNum = String(x)?.split(".");
    const wholeNum = splitNum[0];
    const floatNum = splitNum?.[1] || "";
    const numWithCommas = wholeNum
      ?.toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return floatNum
      ? numWithCommas + "." + floatNum.substring(0, 2)
      : numWithCommas;
  } else return 0;
}

export const formatHtmlText = (text) =>
  isString(text) ? (
    <div
      dangerouslySetInnerHTML={{
        __html: JSON.parse(text),
      }}
    />
  ) : (
    ""
  );

export const formatHtmlTextAlt = (text) =>
  isString(text) ? (
    <div
      className="!font-sans"
      dangerouslySetInnerHTML={{
        __html: text,
      }}
    />
  ) : (
    ""
  );

export const convertJSONCharacters = (jsonString) => {
  let convertedString = jsonString
    // .replace(/:/g, " ") // Replace all colons with hyphens
    // .replace(/{/g, " ") // Replace all curly braces opening with parentheses opening
    // .replace(/}/g, " ") // Replace all curly braces closing with parentheses closing
    .replace(/"/g, " "); // Replace all quotes braces closing with parentheses closing

  return convertedString;
};
