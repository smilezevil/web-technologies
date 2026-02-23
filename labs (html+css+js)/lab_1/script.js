let div = document.getElementsByClassName('container')[0];
div.textContent = 'Hello World!';

let button = document.getElementsByClassName('button')[0];
button.onmouseout = function(){
    console.error("Student: Nastya Demyanchuk");
}