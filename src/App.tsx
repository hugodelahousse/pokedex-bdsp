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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-6 flex flex-col justify-center relative overflow-hidden sm:py-12 px-2 sm:px-10">
      <div>
        <input
          type="checkbox"
          checked={showNationalDex}
          onChange={() => setShowNationalDex((v) => !v)}
        />
        <label
          className="form-check-label inline-block text-gray-800 dark:text-white ml-2 text-lg"
          htmlFor="flexCheckChecked"
        >
          Show national dex
        </label>
      </div>
      <ProgressBar current={selectedPokemonSet.size} total={pokemons.length} />
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
      className={`flex flex-row items-center rounded-md shadow-lg py-2 px-4 w-full relative gap-3 dark:bg-slate-800 dark:text-white ${
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
          <div className="locations">
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

const ProgressBar: FC<{ current: number; total: number }> = ({
  current,
  total,
}) => {
  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span className="text-lg font-semibold inline-block px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
            {current} / {total}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xl font-semibold inline-block text-emerald-600 dark:text-emerald-200">
            {((100 * current) / total).toFixed()}%
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-200">
        <div
          style={{ width: `${(100 * current) / total}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-600"
        />
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
