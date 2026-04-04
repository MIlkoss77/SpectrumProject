// Генерируем свечи для демонстрации
export function genCandles(n = 400, start = 68420.5, noise = 0.015) {

  const arr = []
  let price = start
  for (let i = 0; i < n; i++) {
    const drift = (Math.random() - 0.5) * noise * start
    const open = price
    const close = price + drift
    const hi = Math.max(open, close) + Math.random() * noise * start * 0.3
    const lo = Math.min(open, close) - Math.random() * noise * start * 0.3
    arr.push({ t: i, o: open, h: hi, l: lo, c: close })
    price = close
  }
  return arr
}
