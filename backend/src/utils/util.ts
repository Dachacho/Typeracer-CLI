export default function compare(original: string, input: string) {
  const originalArr = original.split("");
  const inputArr = input.split("");

  let correct = 0;
  for (let i = 0; i < originalArr.length; i++) {
    if (inputArr[i] === originalArr[i]) {
      correct++;
    }
  }

  const accuracy = correct / originalArr.length;
  return accuracy;
}
