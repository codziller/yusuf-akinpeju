export function includesNumber(string) {
  const numberRegex = /\d/;
  return numberRegex.test(string);
}

export function includesUppercase(string) {
  const uppercase = /[A-Z]/;
  return uppercase.test(string);
}

/* eslint-disable no-useless-escape */
export function includesSpecialCharacter(string) {
  const includesSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  return includesSpecialCharacter.test(string);
}

export function passwordValidation(password) {
  const test = [
    {
      text: "Contains at least one uppercase letter",
      test: includesUppercase(password),
      type: "uppercase",
    },
    {
      text: "Contains eight characters",
      test: password.length > 7,
      type: "characters",
    },

    {
      text: "Contains at least one number",
      test: !!includesNumber(password),
      type: "number",
    },
    {
      text: "Contains at least one symbol (*#.!$(%-_)",
      test: includesSpecialCharacter(password),
      type: "special_characters",
    },
  ];
  return test;
}
