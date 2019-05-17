function randomInt(max, min, mutiple = 1){    
    return (Math.floor( Math.random() * ( Number(max) - Number(min) + 1) ) + Number(min)) * mutiple;
}

// 最大公因數
function gcd(m, n) {
    let remainder = 0;
    do {
      remainder = m % n;
      m = n;
      n = remainder;
    } while (remainder !== 0);
    return m;
  }
  
// 最小公倍數
function lcm(m, n) {
    return (m*n) / gcd(m,n)
}

// 檢查掉落數量最少要能填滿4行的量，為一個基礎量
function chekcRowAtleast4 (row, lcmItems) {
    if(row < 4){
        switch (row%4) {
            case 1:
            lcmItems = lcmItems * 4            
            break;
            case 2:
            lcmItems = lcmItems * 2
            break;
            case 3:
            lcmItems = lcmItems * 2
            break;
        } 
    }    
    return lcmItems
}

// 取得最小掉落組數，且4行以上
function getItems (m, n, col) {
    let items = lcm(m, n)
    let row = Math.ceil(items / col) 
    return chekcRowAtleast4(row, items)
}

export {
    randomInt,
    gcd,
    lcm,
    getItems
}
