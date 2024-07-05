export function rtfToText(rtf) {
  const rtfRegex = /\\([a-z]+)(-?\d+)? ?|[{}]|\\'([0-9a-fA-F]{2})|([^\\{}]+)/g;
  let match;
  let output = [];
  let stack = [];

  while ((match = rtfRegex.exec(rtf)) !== null) {
    if (match[0] === "{") {
      stack.push(output.length);
    } else if (match[0] === "}") {
      output.splice(stack.pop(), 0);
    } else if (match[0][0] === "\\") {
      if (match[1] === "par" || match[1] === "line") {
        output.push("\n");
      } else if (match[1] === "tab") {
        output.push("\t");
      } else if (match[1] === "uc") {
        // Unicode character count to skip
        rtfRegex.lastIndex += Number(match[2]);
      } else if (match[1] === "'") {
        output.push(String.fromCharCode(parseInt(match[3], 16)));
      }
    } else {
      output.push(match[0]);
    }
  }
  return output.join("");
}
