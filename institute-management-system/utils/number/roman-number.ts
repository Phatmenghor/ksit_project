export function toRoman(num: number): string {
  const roman = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  const value = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  let result = "";
  for (let i = 0; i < value.length; i++) {
    while (num >= value[i]) {
      result += roman[i];
      num -= value[i];
    }
  }
  return result;
}
