import axios from 'axios';
import './App.css';
import {useEffect, useState} from "react"; // Import CSS file for styling

function App() {
    const [query, setQuery] = useState('');
    const [pokemonData, setPokemonData] = useState(null);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=9&offset=${(currentPage - 1) * 9}`);
                const promises = response.data.results.map(async (result) => {
                    const pokemonResponse = await axios.get(result.url);
                    return pokemonResponse.data;
                });
                const pokemonDetails = await Promise.all(promises);
                setPokemonData(pokemonDetails);
                setTotalPages(Math.ceil(response.data.count / 9));
                setError(null);
            } catch (error) {
                setPokemonData(null);
                setError('Error fetching data');
            }
        };
        fetchData();
    }, [currentPage]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    useEffect(() => {
        console.log("Favorites updated:", favorites);
    }, [favorites]);

    const searchPokemon = async () => {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
            setPokemonData([response.data]);
            setError(null);
        } catch (error) {
            setPokemonData(null);
            setError('Pokemon not found!');
        }
    };

    const addToFavorites = async (pokemon) => {
        const pokemonDetails = await fetchPokemonDetails(pokemon);
        const newFavorites = [...favorites, pokemonDetails];
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    const fetchPokemonDetails = async (pokemon) => {
        const response = await axios.get(pokemon.url);
        return response.data;
    };

    const removeFromFavorites = (pokemon) => {
        const newFavorites = favorites.filter((item) => item.name !== pokemon.name);
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    const handlePagination = (action) => {
        if (action === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else if (action === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="container">
            <h1>Pokemon Search</h1>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Pokemon name or ID"
            />
            <button onClick={searchPokemon}>Search</button>
            {error && <p className="error">{error}</p>}
            <div className="grid-container">
                {pokemonData &&
                    pokemonData.map((pokemon, index) => (
                        <div className="card" key={index}>
                            <img className="pokemon-image" src={pokemon.sprites.front_default} alt={pokemon.name} />
                            <div className="pokemon-details">
                                <h3>{pokemon.name}</h3>
                                <p>Height: {pokemon.height /10 +"m"}</p>
                                <p>Weight: {pokemon.weight /10 +"kg"}</p>
                                <h4>Abilities:</h4>
                                <ul>
                                    {pokemon.abilities.map((ability, index) => (
                                        <li key={index}>{ability.ability.name}</li>
                                    ))}
                                </ul>
                                <button onClick={() => addToFavorites(pokemon)}>Add to Favorites</button>
                            </div>
                        </div>
                    ))}
            </div>
            <h2>Favorites</h2>
            <div className="favorites">
                {favorites &&
                    favorites.map((pokemon, index) => (
                        <div className="card" key={index}>
                            <img className="pokemon-image" src={pokemon.sprites.front_default} alt={pokemon.name} />
                            <div className="pokemon-details">
                                <h3>{pokemon.name}</h3>
                                <p>Height: {pokemon.height /10 +"m"}</p>
                                <p>Weight: {pokemon.weight /10 +"kg"}</p>
                                <h4>Abilities:</h4>
                                <ul>
                                    {pokemon.abilities.map((ability, index) => (
                                        <li key={index}>{ability.ability.name}</li>
                                    ))}
                                </ul>
                                <button onClick={() => removeFromFavorites(pokemon)}>Remove from Favorites</button>
                            </div>
                        </div>
                    ))}
            </div>
            <div className="pagination">
                <button onClick={() => handlePagination('prev')}>Previous</button>
                <span>{currentPage}</span>
                <button onClick={() => handlePagination('next')}>Next</button>
            </div>
        </div>
    );
}

export default App;
