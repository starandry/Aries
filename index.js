// DEMO JOKE APP
import scriptInit from './script.js'
import './style.scss'
import symbol from './icons/cypher.svg';
import logo from './icons/logo.svg';
/*import './icons/cypher.svg';*/
// Import sprite instance which already contains twitter logo required above
import sprite from 'svg-sprite-loader/runtime/sprite.build.js';
import svgSpriteSvg from "./svg-sprite.svg";
import axios from 'axios';
import test from "./images/min/hero.png";
/*sprite.add(logo);*/
/*import laughing from './assets/laughing.svg'*/

const testImg = document.getElementById('test');
testImg.src = test;

/*scriptInit();*/

function generateJoke() {
    const config = {
        headers: {
           /* Accept: 'application/json',*/
        },
    }

    axios.get('/svg-sprite.svg', config).then((res) => {
        const svgSpriteElem = document.getElementById('main-svg-sprite');
        svgSpriteElem.innerHTML = res.data;
    })
}

generateJoke();

/*
export default generateJoke
*/




// Render sprite
/*
const spriteContent = sprite.stringify();
const svgSprite = `${spriteContent}`;
console.log(sprite);
const svgSpriteElem = document.getElementById('main-svg-sprite');
svgSpriteElem.innerHTML = svgSprite;*/
