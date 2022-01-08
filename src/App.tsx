import {
  Dispatch,
  FC,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import logo from "./logo.svg";
import "./App.css";
import data from "./data.json";
import { PokemonData } from "./types";

const POKEMONS = data as any as ReadonlyArray<PokemonData>;

function useStateWithLocalStorage<T>(
  storageKey: string,
  initialState: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(storageKey);
    if (storedValue !== null && storedValue !== "undefined") {
      return JSON.parse(storedValue) as T;
    }
    if (typeof initialState === "function") {
      return (initialState as () => T)();
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value]);

  return [value, setValue];
}

function arrayToggle<T>(arr: ReadonlyArray<T>, v: T) {
  const s = new Set(arr);
  if (s.has(v)) {
    s.delete(v);
    return [...s];
  }
  return [...s, v];
}

function App() {
  const [showNationalDex, setShowNationalDex] = useState(false);
  const [selectedPokemons, setSelectedPokemons] = useStateWithLocalStorage<
    ReadonlyArray<number>
  >("selectedPokemons", []);
  const selectedPokemonSet = useMemo(
    () => new Set(selectedPokemons),
    [selectedPokemons]
  );

  const pokemons = useMemo(() => {
    if (showNationalDex) return POKEMONS;
    return POKEMONS.filter(
      (p): p is PokemonData & { regionalDexNumber: number } =>
        p.regionalDexNumber !== null
    ).sort((a, b) => a.regionalDexNumber - b.regionalDexNumber);
  }, [POKEMONS, showNationalDex]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 flex flex-col justify-center relative overflow-hidden sm:py-12 px-2">
      <div>
        <input
          type="checkbox"
          value={showNationalDex ? "true" : ""}
          onChange={() => setShowNationalDex((v) => !v)}
        />
        <label
          className="form-check-label inline-block text-gray-800"
          htmlFor="flexCheckChecked"
        >
          Show national dex
        </label>
      </div>
      <div className="flex flex-row flex-wrap gap-4 justify-around">
        {pokemons.map((pokemon) => (
          <Pokemon
            pokemon={pokemon}
            isSelected={selectedPokemonSet.has(pokemon.dexNumber)}
            onClick={() =>
              setSelectedPokemons((v) => arrayToggle(v, pokemon.dexNumber))
            }
            useRegionalDexNumber={!showNationalDex}
          />
        ))}
      </div>
    </div>
  );
}

interface PokemonProps {
  pokemon: PokemonData;
  isSelected: boolean;
  onClick: MouseEventHandler;
  useRegionalDexNumber: boolean;
}

const Pokemon: FC<PokemonProps> = ({
  pokemon: { name, dexNumber, regionalDexNumber, locations },
  isSelected,
  onClick,
  useRegionalDexNumber,
}) => {
  return (
    <div
      className={`flex flex-row items-center rounded-md shadow-lg p-2 w-full sm:w-2/5 relative gap-2 ${
        isSelected && "bg-green-300"
      }`}
    >
      <input
        type="checkbox"
        value={isSelected ? "true" : ""}
        checked={isSelected}
        onClick={onClick}
        className="w-5 h-5 shrink-0"
      />
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNumber}.png`}
        className="flex w-24 aspect-auto object-contain"
      />
      <div>
        <div className="text-lg">
          <span className="font-extralight">
            #{useRegionalDexNumber ? regionalDexNumber : dexNumber}{" "}
          </span>
          <span className="font-semibold">{name}</span>
        </div>
        {!isSelected && (
          <div>
            {intersperse(
              locations.map((location) => (
                <span dangerouslySetInnerHTML={{ __html: location }} />
              )),
              <span>, </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function intersperse<T>(arr: ReadonlyArray<T>, separator: T) {
  return arr.flatMap((item, index) =>
    index === arr.length - 1 ? item : [item, separator]
  );
}

export default App;
