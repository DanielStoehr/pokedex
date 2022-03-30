let pokemonList
let currentId

async function loadPokemonList(limit = 10) {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`
    const response = await fetch(url)
    const data = await response.json()
    return data.results
}

async function loadPokemon(url) {
    let response = await fetch(url)
    return await response.json()
}

async function setPokemonList() {
    const list = await loadPokemonList()
    pokemonList = await Promise.all(list.map(async item => await loadPokemon(item.url)))
}

async function init() {
    await setPokemonList()
    console.log(pokemonList)
    renderPokemonInfos()
}

function formatIdToString(number) {
    let string = number.toString()
    for (let i = string.length; i < 3; i++) {
        string = "0" + string
    }
    return string
}

function renderPokemonInfos() {
    for (let i = 0; i < pokemonList.length; i++) {
        const pokemon = pokemonList[i]
        console.log(pokemon)
        const image = pokemon.sprites.other.home.front_default
        const container = document.getElementById('pokedex')
        const type = pokemon.types[0].type.name
        container.innerHTML += `
            <div class="info-container ${type}" onclick="openDetail(${i})">
                <div>
                    <h2>${pokemon.name}</h2>
                    ${renderTypes(pokemon.types)}
                </div>
                <img alt="pokemon-image" src="${image}"/>
            </div>
        `
    }
}

function renderTypes(types) {
    let content = ''
    for (let i = 0; i < types.length; i++) {
        const type = types[i]
        content += `<div class="types">${type.type.name}</div>`
    }
    return content
}

function openDetail(id) {
    currentId = id
    const pokemon = pokemonList[currentId]
    document.getElementById('detail-name').innerHTML = pokemon.name
    document.getElementById('detail-pokemon-id').innerHTML = `#${formatIdToString(pokemon.id)}`
    document.getElementById('detail-types').innerHTML = renderTypes(pokemon.types)
    document.getElementById('detail-image').src = pokemon.sprites.other.home.front_default
    changeSection('about')
    document.getElementById('modal').style.display = ""
}

function closeModal() {
    document.getElementById('modal').style.display = "none"
}

function changeSection(section) {
    for (item of document.getElementsByClassName('detail-nav-link')) {
        item.classList.remove('active')
    }
    document.getElementById(`detail-nav-${section}`).classList.add('active')
    const detailTable = document.getElementById('detail-table')
    if (section === 'about') {
        detailTable.innerHTML = renderDetailAbout()
    } else {
        detailTable.innerHTML = renderDetailBase()
    }
}

function renderDetailAbout() {
    const pokemon = pokemonList[currentId]
    const species = pokemon.species.name
    const height = pokemon.height
    const weight = pokemon.weight
    const abilities = pokemon.abilities.map(ability => ability.ability.name)
    return `
        <tr>
            <th>Species</th>
            <td>${species}</td>
        </tr>
        <tr>
            <th>Height</th>
            <td>${height}</td>
        </tr>
        <tr>
            <th>Weight</th>
            <td>${weight}</td>
        </tr>
        <tr>
            <th>Abilities</th>
            <td>${abilities.join(', ')}</td>
        </tr>
    `
}

function renderDetailBase() {
    const pokemon = pokemonList[currentId]
    const stats = pokemon.stats
    const values = stats.map(stat => {
        return {
            name: stat.stat.name,
            value: stat.base_stat
        }
    })
    let content = '';
    for (item of values) {
        const progressClass = item.value < 50 ? "progress-red" : "progress-green"
        content += `
            <tr>
                <th>${item.name}</th>
                <td>${item.value}</td>
                <td>
                <div class="progress-field">
                    <div class="${progressClass}" style="width: ${item.value}%"></div>
                </div>
                </td>
            </tr>
        `
    }
    return content
}