function minmaxArr(arr){

    let max = arr[0]
    let min = arr[0]

    for (let i = 1; i < arr.length; i++){
        if(arr[i] > max){
            max = arr[i];
        }

        if(arr[i] < min){
            min = arr[i];
        }
    }
    return {max, min};
}

console.log(minmaxArr([3,6,1,-10,0,2]))

let player1 = {
    username: "smilezevil",
    level: 30,
    power: 20,
};

let player2 = {
    username: "moonbaloon",
    level: 25,
    power: 15,
}

function playerCompare(obj1, obj2) {
    if (obj1.power > obj2.power) {
        return `Player ${obj1.username} stronger than ${obj2.username} by power`;
    } else if (obj1.power < obj2.power) {
        return `Player ${obj2.username} stronger than ${obj1.username} by power`;
    } else {
        return `Player ${obj1.username} and ${obj2.username} have the same power`;
    }
}

console.log(playerCompare(player1, player2));