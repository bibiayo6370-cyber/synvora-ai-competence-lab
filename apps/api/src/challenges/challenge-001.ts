import { challengeSchema, EXPRESSION_LIMITS } from "@synvora/shared";

export const publicChallenge = challengeSchema.parse({
  id: "001", version: "0.1", title: "Understand and extend calculateTotal",
  objective: "Trace function parameters and arithmetic, predict output, explain behavior, and validate a percentage discount.",
  starterCode: "function calculateTotal(price, quantity) {\n  return price * quantity;\n}\nconsole.log(calculateTotal(1500, 3));",
  modificationTemplate: "function calculateTotal(price, quantity, discount) {\n  const total = price * quantity;\n  return /* learner expression */;\n}",
  resource: { title: "Functions, parameters, and arithmetic", author: "SYNVORA",
    content: "A function groups instructions under a name. Parameters are names for values supplied when the function is called. Arguments fill those parameters in order: in multiply(4, 2), the first parameter receives 4 and the second receives 2. An arithmetic expression combines numbers or named values using operators such as +, -, *, and /. Multiplication and division happen before addition and subtraction; parentheses can change that order. A return statement sends the expression's value back to the caller. To trace a function, substitute the argument values for its parameter names, calculate the expression step by step, and identify the returned value." },
  example: { price: 1500, quantity: 3, discount: 10, expected: 4050 },
  permittedSyntax: "Use total, discount, decimal numbers, parentheses, unary +/-, and binary +, -, *, /. No JavaScript statements, calls, properties, comments, or exponent notation.",
  limits: EXPRESSION_LIMITS
});
export const referenceOutput = "4500";
