const http = require("http");
const axios = require("axios");
const fs = require("fs");

const PORT = 3000;

// consigue array de pokemones con nombre y url
async function getData() {
  try {
    const { data } = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=151"
    );
    return data.results;
  } catch (e) {
    console.log("Error: ", e.message);
  }
}

// consigue info de cada pokemon segun su url
async function getPokeData(url) {
  try {
    const { data } = await axios.get(`${url}`);
    const pokemon = {
      pokedex: data.id,
      nombre: data.name,
      img: data.sprites.front_default,
    };
    return pokemon;
  } catch (e) {
    console.log("Error: ", e.message);
  }
}

// devuelve array de promesas
async function main() {
  let allPokemon = await getData();
  let promiseArray = [];
  allPokemon.forEach(async (element) => {
    let pokemon = getPokeData(element.url);
    promiseArray.push(pokemon);
  });
  return promiseArray;
}

http
  .createServer(async (req, res) => {
    // levanta servidor que devuelva index.html en ruta '/'
    if (req.url == "/") {
      res.writeHead(200, { "content-Type": "text/html" });
      fs.readFile("index.html", "utf-8", (err, html) => {
        res.end(html);
      });
    }
    // crea ruta '/pokemones' para consulta del html
    if (req.url == "/pokemones") {
      // devuelve array de pokemones, ordenados por pokedex, cada uno con nombre e imagen
      let promiseArray = await main();
      let new_arr = await Promise.all(promiseArray);
      res.end(JSON.stringify(new_arr));
    }
  })
  .listen(PORT, () => console.log("Escuchando en el puerto", PORT));
